import asyncio
from fastapi import APIRouter
from fastapi.responses import StreamingResponse
import os

# Import schemas - use relative import from app/
from app.schemas import ChatRequest, VideoResponse
from app.storage import gemini_client, sf_client, groq_client, get_youtube_videos, save_chat_to_db, get_chat_history, save_portfolio

router = APIRouter(prefix="/chat", tags=["AI Agents"])


@router.post("/cofounder")
async def cofounder_chat(request: ChatRequest):
    """AI Co-founder agent for startup/roadmap help"""
    
    async def generate():
        full_response = ""
        winner_model = "Unknown"
        
        # Save user message to DB
        asyncio.create_task(
            asyncio.to_thread(save_chat_to_db, request.user_id, "user", request.message, "cofounder")
        )
        
        CoFounder_system_prompt = (
            "You are an expert strategic co-founder. "
            "If the user says 'hi', 'hello', or greets you without a specific idea, "
            "respond warmly and ask them what startup or project they are thinking about. "
            "If the user provides a specific idea or goal, provide a professional, "
            "step-by-step roadmap to help them launch it."
        )
        
        # Check if greeting
        is_greeting = any(word in request.message.lower() for word in ["hi", "hello", "hey"])
        words_count = len(request.message.split())
        
        video_task = None
        if not is_greeting and words_count > 2:
            video_task = asyncio.create_task(
                asyncio.to_thread(get_youtube_videos, f"{request.message} business roadmap 2025")
            )
        
        # Race Logic: Call Gemini and Groq in parallel
        async def call_gemini():
            try:
                if gemini_client is None:
                    return (None, "Gemini")
                response = await gemini_client.models.generate_content(
                    model='gemini-2.0-flash',
                    contents=[
                        {"role": "user", "parts": [{"text": CoFounder_system_prompt}]},
                        {"role": "user", "parts": [{"text": request.message}]}
                    ]
                )
                return (response.text, "Gemini")
            except Exception as e:
                print(f"Gemini Error: {e}")
                return (None, "Gemini")

        async def call_groq():
            try:
                if groq_client is None:
                    return (None, "Groq")
                response = await groq_client.chat.completions.create(
                    model="llama-3.3-70b-versatile",
                    messages=[
                        {"role": "system", "content": CoFounder_system_prompt},
                        {"role": "user", "content": request.message}
                    ]
                )
                return (response.choices[0].message.content, "Groq")
            except Exception as e:
                print(f"Groq Error: {e}")
                return (None, "Groq")

        # Run both calls in parallel with 10-second timeout
        t1 = asyncio.create_task(call_gemini())
        t2 = asyncio.create_task(call_groq())
        
        try:
            # Wait for first result with 10-second timeout
            done, pending = await asyncio.wait(
                {t1, t2}, 
                return_when=asyncio.FIRST_COMPLETED,
                timeout=10.0  # 10 seconds timeout
            )
            
            winner_result = None
            
            for task in done:
                result, model_name = task.result()
                if result:
                    winner_result = result
                    winner_model = model_name
                    break
            
            # Cancel any remaining tasks
            for p in pending:
                p.cancel()
                
        except asyncio.TimeoutError:
            # Timeout - return fallback immediately
            winner_result = None

        print(f"Race Winner: {winner_model}")
            
        if winner_result:
            full_response = winner_result
            yield winner_result
        else:
            fallback_msg = "Both AI services are currently busy. Please try again."
            full_response = fallback_msg
            yield fallback_msg
        
        # Handle YouTube video task
        if video_task:
            try:
                videos = await video_task 
                has_roadmap = any(x in full_response.lower() for x in ["roadmap", "step 1", "strategy", "launch"])
                
                if videos and has_roadmap:
                    video_text = "\n\n### Recommended Tutorials:\n"
                    for v in videos:
                        video_text += f"- [{v['title']}]({v['link']})\n"
                    
                    full_response += video_text
                    yield video_text
            except Exception as e:
                print(f"Video Error: {e}")

        asyncio.create_task(
            asyncio.to_thread(save_chat_to_db, request.user_id, "assistant", full_response, f"Co-founder({winner_model})")
        )

    return StreamingResponse(generate(), media_type="text/plain")


@router.post("/mentor")
async def mentor_chat(request: ChatRequest):
    """AI Mentor agent for interview practice - with 429 fallback to Groq"""
    
    async def generate():
        full_response = ""
        
        mentor_system_prompt = (
            "You are a wise and supportive Interview Mentor. "
            "Help the user practice for job interviews. "
            "Ask about their background, skills, and target job. "
            "Provide constructive feedback and tips. "
            "Keep your tone encouraging and professional."
        )
        
        asyncio.create_task(
            asyncio.to_thread(save_chat_to_db, request.user_id, "user", request.message, "mentor")
        )

        # Try SiliconFlow (DeepSeek) first
        client_used = None
        response = None
        
        try:
            if sf_client is not None:
                client_used = "SiliconFlow"
                response = await sf_client.chat.completions.create(
                    model="deepseek-ai/DeepSeek-V3",
                    messages=[
                        {"role": "system", "content": mentor_system_prompt},
                        {"role": "user", "content": request.message}
                    ],
                    stream=True
                )
        except Exception as e:
            error_msg = str(e)
            print(f"SiliconFlow Mentor Error: {e}")
            
            # Check for 429 error - fallback to Groq
            if "429" in error_msg or "RESOURCE_EXHAUSTED" in error_msg or "quota" in error_msg.lower():
                print("SiliconFlow quota exceeded, falling back to Groq...")
                try:
                    if groq_client is not None:
                        client_used = "Groq"
                        response = await groq_client.chat.completions.create(
                            model="llama-3.3-70b-versatile",
                            messages=[
                                {"role": "system", "content": mentor_system_prompt},
                                {"role": "user", "content": request.message}
                            ],
                            stream=True
                        )
                except Exception as groq_error:
                    print(f"Groq fallback also failed: {groq_error}")
                    yield "Sorry, all AI services are currently unavailable. Please try again later."
                    return
            else:
                # Try Groq for other errors too
                try:
                    if groq_client is not None:
                        client_used = "Groq"
                        response = await groq_client.chat.completions.create(
                            model="llama-3.3-70b-versatile",
                            messages=[
                                {"role": "system", "content": mentor_system_prompt},
                                {"role": "user", "content": request.message}
                            ],
                            stream=True
                        )
                except Exception as groq_error:
                    print(f"Groq fallback also failed: {groq_error}")
                    yield "Sorry, all AI services are currently unavailable. Please try again later."
                    return
        else:
            if response is None:
                yield "Mentor service is not available. Please check API configuration."
                return

        # Stream the response word-by-word
        try:
            async for chunk in response:
                if chunk.choices and chunk.choices[0].delta.content:
                    content = chunk.choices[0].delta.content
                    full_response += content
                    yield content
            
            # Save to DB
            model_name = "mentor (DeepSeek-V3)" if client_used == "SiliconFlow" else "mentor (Llama-3.3-70B)"
            asyncio.create_task(
                asyncio.to_thread(save_chat_to_db, request.user_id, "assistant", full_response, model_name)
            )
            
        except Exception as e:
            print(f"Mentor Streaming Error: {e}")
            yield f"Mentor Error: {str(e)}"

    return StreamingResponse(generate(), media_type="text/plain")


@router.post("/support")
async def support_chat(request: ChatRequest):
    """Customer Support agent - non-streaming JSON response"""
    
    support_system_prompt = (
        "You are a helpful and professional Customer Support Assistant. "
        "Provide clear, concise, and accurate information."
    )
    
    asyncio.create_task(
        asyncio.to_thread(save_chat_to_db, request.user_id, "user", request.message, "support")
    )
    
    try:
        if groq_client is None:
            return {"reply": "Support service is not available. Please check API configuration."}
            
        response = await groq_client.chat.completions.create(
            model="llama-3.1-8b-instant",
            messages=[
                {"role": "system", "content": support_system_prompt},
                {"role": "user", "content": request.message}
            ]
        )
        
        reply = response.choices[0].message.content
        
        asyncio.create_task(
            asyncio.to_thread(save_chat_to_db, request.user_id, "assistant", reply, "support (Llama-3.1-8B)")
        )
        
        return {"reply": reply}
    except Exception as e:
        print(f"Support Agent Error: {e}")
        return {"error": str(e)}


@router.post("/roadmap")
async def generate_roadmap(request: ChatRequest):
    """AI Roadmap generator - returns structured roadmap and YouTube videos"""
    
    roadmap_system_prompt = (
        "You are an expert career and business roadmap generator. "
        "Create a detailed, step-by-step roadmap for the user's goal. "
        "Include: 1. A clear title, 2. Brief overview, 3. 3-4 phases with titles and descriptions, "
        "4. Duration for each phase, 5. Key tasks, 6. Helpful tips. "
        "Be specific, actionable, and encouraging. Use current best practices for 2025."
    )
    
    # Save user message
    asyncio.create_task(
        asyncio.to_thread(save_chat_to_db, request.user_id, "user", request.message, "roadmap")
    )
    
    roadmap_content = None
    used_model = "Gemini"
    
    # Try Gemini first
    try:
        if gemini_client is not None:
            response = await gemini_client.models.generate_content(
                model='gemini-2.0-flash',
                contents=[
                    {"role": "user", "parts": [{"text": roadmap_system_prompt}]},
                    {"role": "user", "parts": [{"text": f"Create a roadmap for: {request.message}"}]}
                ]
            )
            roadmap_content = response.text
    except Exception as e:
        error_msg = str(e)
        print(f"Gemini Roadmap Error: {e}")
        
        # Check for 429 (quota exceeded) error
        if "429" in error_msg or "RESOURCE_EXHAUSTED" in error_msg or "quota" in error_msg.lower():
            print("Gemini quota exceeded, falling back to Groq...")
            used_model = "Groq"
            
            # Fallback to Groq
            try:
                if groq_client is not None:
                    response = await groq_client.chat.completions.create(
                        model="llama-3.3-70b-versatile",
                        messages=[
                            {"role": "system", "content": roadmap_system_prompt},
                            {"role": "user", "content": f"Create a roadmap for: {request.message}"}
                        ]
                    )
                    roadmap_content = response.choices[0].message.content
            except Exception as groq_error:
                print(f"Groq fallback also failed: {groq_error}")
        else:
            # Other errors - try Groq as fallback anyway
            used_model = "Groq"
            try:
                if groq_client is not None:
                    response = await groq_client.chat.completions.create(
                        model="llama-3.3-70b-versatile",
                        messages=[
                            {"role": "system", "content": roadmap_system_prompt},
                            {"role": "user", "content": f"Create a roadmap for: {request.message}"}
                        ]
                    )
                    roadmap_content = response.choices[0].message.content
            except Exception as groq_error:
                print(f"Groq fallback also failed: {groq_error}")
    
    # If still no content, return error
    if not roadmap_content:
        return {
            "error": "All AI services failed",
            "message": "Both Gemini and Groq are unavailable. Please try again later.",
            "roadmap": "",
            "videos": []
        }
    
    # Fetch 3 related YouTube videos
    videos = []
    try:
        videos = await asyncio.to_thread(
            get_youtube_videos, 
            f"{request.message} tutorial 2025"
        )
        videos = videos[:3] if videos else []
    except Exception as e:
        print(f"Video Fetch Error: {e}")
    
    result = {
        "roadmap": roadmap_content,
        "videos": videos
    }
    
    # Save AI response
    asyncio.create_task(
        asyncio.to_thread(
            save_chat_to_db,
            request.user_id,
            "assistant",
            roadmap_content,
            f"roadmap ({used_model})"
        )
    )
    
    return result


@router.post("/portfolio-analysis")
async def analyze_portfolio(request: ChatRequest):
    """Portfolio Analysis: Fetch chat history, analyze with AI, and save to student_portfolios"""
    
    # 1. Fetch all messages from chat_history for this user
    chat_logs = await asyncio.to_thread(get_chat_history, request.user_id, limit=100)
    
    if not chat_logs:
        return {
            "error": "No chat history found",
            "message": "Start chatting with AI agents to build your portfolio analysis."
        }
    
    # Format chat logs for AI analysis
    formatted_logs = "\n".join([
        f"[{log.get('agent_type', 'unknown')}] {log.get('role', 'user')}: {log.get('message', '')}"
        for log in chat_logs
    ])
    
    # 2. AI Analysis prompt
    portfolio_system_prompt = (
        "You are a career analyst AI. Based on the user's learning logs, analyze their career trajectory. "
        "Provide a JSON response with:\n"
        "1. career_role: The most suitable career role for this student (e.g., Full Stack Developer, Data Scientist, Product Manager)\n"
        "2. skills: A comma-separated list of their top 5 skills (e.g., Python, React, Machine Learning, Communication, Leadership)\n"
        "3. summary: A 3-line professional summary for a CV (line1: expertise, line2: achievements, line3: career goal)\n\n"
        f"Learning Logs:\n{formatted_logs}\n\n"
        "Respond ONLY in JSON format like: {\"career_role\": \"...\", \"skills\": \"..., ..., ...\", \"summary\": \"... ... ...\"}"
    )
    
    # 3. Send to AI for analysis
    analysis_result = None
    used_model = "Groq"
    
    try:
        # Try Groq first
        if groq_client is not None:
            response = await groq_client.chat.completions.create(
                model="llama-3.3-70b-versatile",
                messages=[
                    {"role": "system", "content": portfolio_system_prompt},
                    {"role": "user", "content": "Analyze my learning logs and provide career insights."}
                ]
            )
            analysis_result = response.choices[0].message.content
    except Exception as e:
        print(f"Groq Portfolio Analysis Error: {e}")
        
        # Fallback to Gemini
        try:
            if gemini_client is not None:
                used_model = "Gemini"
                response = await gemini_client.models.generate_content(
                    model='gemini-2.0-flash',
                    contents=[
                        {"role": "user", "parts": [{"text": portfolio_system_prompt}]},
                        {"role": "user", "parts": [{"text": "Analyze my learning logs and provide career insights."}]}
                    ]
                )
                analysis_result = response.text
        except Exception as gemini_error:
            print(f"Gemini fallback also failed: {gemini_error}")
    
    if not analysis_result:
        return {
            "error": "AI analysis failed",
            "message": "Both Gemini and Groq are unavailable. Please try again later."
        }
    
    # 4. Parse the AI response to extract JSON
    import re
    import json
    
    try:
        # Try to extract JSON from response
        json_match = re.search(r'\{[\s\S]*\}', analysis_result)
        if json_match:
            portfolio_data = json.loads(json_match.group())
        else:
            # If no JSON found, create a structured response
            portfolio_data = {
                "career_role": "Professional Learner",
                "skills": "Learning, Communication, Problem Solving, Adaptability, Growth",
                "summary": analysis_result[:200]
            }
    except Exception as parse_error:
        print(f"JSON Parse Error: {parse_error}")
        portfolio_data = {
            "career_role": "Professional Learner",
            "skills": "Learning, Communication, Problem Solving",
            "summary": analysis_result[:200] if analysis_result else "Unable to generate summary."
        }
    
    career_role = portfolio_data.get("career_role", "Professional Learner")
    skills = portfolio_data.get("skills", "Learning, Communication")
    summary = portfolio_data.get("summary", "Unable to generate summary.")
    
    # 5. Auto-post: Save to student_portfolios table
    save_success = await asyncio.to_thread(
        save_portfolio,
        request.user_id,
        career_role,
        skills,
        summary
    )
    
    if save_success:
        return {
            "success": True,
            "career_role": career_role,
            "skills": skills,
            "summary": summary,
            "message": "Portfolio analysis saved to Employee Dashboard!"
        }
    else:
        return {
            "success": True,
            "career_role": career_role,
            "skills": skills,
            "summary": summary,
            "message": "Analysis complete but could not save to database."
        }
