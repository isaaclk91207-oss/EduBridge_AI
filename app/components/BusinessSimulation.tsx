'use client';

import { motion } from 'framer-motion';
import { useState } from 'react';
import { TrendingUp, DollarSign, Users, Lightbulb, BarChart3 } from 'lucide-react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';

export default function BusinessSimulation() {
  const [marketingBudget, setMarketingBudget] = useState(4000);
  const [rndBudget, setRndBudget] = useState(3000);
  const [hiringBudget, setHiringBudget] = useState(3000);
  const [aiAdvice, setAiAdvice] = useState('');
  const [isConsulting, setIsConsulting] = useState(false);

  const totalBudget = 10000;
  const remainingBudget = totalBudget - (marketingBudget + rndBudget + hiringBudget);

  // Calculate projections based on budgets
  const calculateProjections = () => {
    const marketingMultiplier = 1 + (marketingBudget / 10000) * 2;
    const rndMultiplier = 1 + (rndBudget / 10000) * 1.5;
    const hiringMultiplier = 1 + (hiringBudget / 10000) * 1.8;

    const baseRevenue = 50000;
    const baseGrowth = 20;

    const projectedRevenue = Math.round(baseRevenue * marketingMultiplier * rndMultiplier * hiringMultiplier);
    const projectedGrowth = Math.round(baseGrowth * marketingMultiplier * rndMultiplier * hiringMultiplier);

    return { projectedRevenue, projectedGrowth };
  };

  const { projectedRevenue, projectedGrowth } = calculateProjections();

  // Chart data
  const revenueData = [
    { month: 'Jan', current: 50000, projected: projectedRevenue },
    { month: 'Feb', current: 55000, projected: Math.round(projectedRevenue * 1.1) },
    { month: 'Mar', current: 60000, projected: Math.round(projectedRevenue * 1.2) },
    { month: 'Apr', current: 65000, projected: Math.round(projectedRevenue * 1.3) },
    { month: 'May', current: 70000, projected: Math.round(projectedRevenue * 1.4) },
    { month: 'Jun', current: 75000, projected: Math.round(projectedRevenue * 1.5) }
  ];

  const pieData = [
    { name: 'Marketing', value: marketingBudget, color: '#0070f3' },
    { name: 'R&D', value: rndBudget, color: '#10b981' },
    { name: 'Hiring', value: hiringBudget, color: '#f59e0b' },
    { name: 'Remaining', value: Math.max(0, remainingBudget), color: '#6b7280' }
  ];

  const consultAI = async () => {
    setIsConsulting(true);
    setAiAdvice('');

    // Simulate AI thinking
    await new Promise(resolve => setTimeout(resolve, 2000));

    let advice = '';
    if (marketingBudget > 5000) {
      advice = "Strong marketing focus is good for quick growth, but consider balancing with R&D for sustainable innovation.";
    } else if (rndBudget > 4000) {
      advice = "Excellent R&D investment for long-term competitiveness. Ensure marketing keeps up to convert innovations to sales.";
    } else if (hiringBudget > 4000) {
      advice = "Smart hiring strategy for talent acquisition. Monitor productivity and ensure proper onboarding processes.";
    } else {
      advice = "Balanced approach is prudent. Consider market conditions - if competition is high, increase marketing spend.";
    }

    setAiAdvice(advice);
    setIsConsulting(false);
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
      {/* Left Side - Case Description */}
      <motion.div
        className="space-y-6"
        initial={{ opacity: 0, x: -50 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ duration: 0.5 }}
      >
        {/* Case Study */}
        <motion.div
          className="bg-[#1e293b]/50 backdrop-blur-xl border border-white/10 shadow-2xl rounded-lg p-6"
          whileHover={{ scale: 1.02, boxShadow: '0 0 20px rgba(0, 112, 243, 0.3)' }}
          transition={{ duration: 0.3 }}
        >
          <div className="flex items-center space-x-2 mb-4">
            <BarChart3 className="text-[#0070f3]" size={24} />
            <h2 className="text-xl font-bold">Business Simulation</h2>
          </div>

          <h3 className="text-lg font-semibold mb-3">Startup Investment Challenge</h3>
          <p className="text-gray-300 mb-4">
            Your tech startup has secured $10,000 in seed funding. You need to allocate this budget across three key areas:
            Marketing, Product R&D, and Hiring. Make strategic decisions to maximize growth and profitability.
          </p>

          <div className="space-y-4">
            <div className="bg-[#0f172a]/50 rounded-lg p-4">
              <h4 className="font-semibold text-[#0070f3] mb-2">Investment Options:</h4>
              <ul className="text-sm text-gray-300 space-y-1">
                <li><strong>Marketing:</strong> Customer acquisition, brand awareness, sales channels</li>
                <li><strong>R&D:</strong> Product development, innovation, technical improvements</li>
                <li><strong>Hiring:</strong> Talent acquisition, team expansion, expertise enhancement</li>
              </ul>
            </div>

            <div className="bg-[#0f172a]/50 rounded-lg p-4">
              <h4 className="font-semibold text-[#0070f3] mb-2">Budget Allocation:</h4>
              <div className="space-y-3">
                <div>
                  <label className="block text-sm font-medium mb-1">Marketing Budget: ${marketingBudget}</label>
                  <input
                    type="range"
                    min="0"
                    max="10000"
                    value={marketingBudget}
                    onChange={(e) => setMarketingBudget(Number(e.target.value))}
                    className="w-full h-2 bg-gray-700 rounded-lg appearance-none cursor-pointer"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">R&D Budget: ${rndBudget}</label>
                  <input
                    type="range"
                    min="0"
                    max="10000"
                    value={rndBudget}
                    onChange={(e) => setRndBudget(Number(e.target.value))}
                    className="w-full h-2 bg-gray-700 rounded-lg appearance-none cursor-pointer"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">Hiring Budget: ${hiringBudget}</label>
                  <input
                    type="range"
                    min="0"
                    max="10000"
                    value={hiringBudget}
                    onChange={(e) => setHiringBudget(Number(e.target.value))}
                    className="w-full h-2 bg-gray-700 rounded-lg appearance-none cursor-pointer"
                  />
                </div>
              </div>
            </div>

            <div className="bg-[#0f172a]/50 rounded-lg p-4">
              <div className="flex justify-between items-center">
                <span className="text-sm font-medium">Total Budget:</span>
                <span className={`text-sm font-bold ${remainingBudget < 0 ? 'text-red-400' : 'text-green-400'}`}>
                  ${totalBudget - remainingBudget} / ${totalBudget}
                </span>
              </div>
              {remainingBudget < 0 && (
                <p className="text-red-400 text-xs mt-1">Budget exceeded! Adjust allocations.</p>
              )}
            </div>
          </div>
        </motion.div>

        {/* AI Consultation */}
        <motion.div
          className="bg-[#1e293b]/50 backdrop-blur-xl border border-white/10 shadow-2xl rounded-lg p-6"
          whileHover={{ scale: 1.02, boxShadow: '0 0 20px rgba(0, 112, 243, 0.3)' }}
          transition={{ duration: 0.3 }}
        >
          <div className="flex items-center space-x-2 mb-4">
            <Lightbulb className="text-[#0070f3]" size={24} />
            <h2 className="text-xl font-bold">AI Strategic Advisor</h2>
          </div>

          <motion.button
            onClick={consultAI}
            disabled={isConsulting}
            className="w-full bg-[#0070f3] hover:bg-[#0056b3] disabled:bg-gray-600 text-white font-bold py-3 px-4 rounded-lg transition-colors flex items-center justify-center space-x-2 mb-4"
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
          >
            <Lightbulb size={20} />
            <span>{isConsulting ? 'Analyzing...' : 'Consult AI Advisor'}</span>
          </motion.button>

          {aiAdvice && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-[#0070f3]/10 border border-[#0070f3]/20 rounded-lg p-4"
            >
              <p className="text-[#0070f3] text-sm leading-relaxed">{aiAdvice}</p>
            </motion.div>
          )}
        </motion.div>
      </motion.div>

      {/* Right Side - Interactive Dashboard */}
      <motion.div
        className="space-y-6"
        initial={{ opacity: 0, x: 50 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ duration: 0.5, delay: 0.2 }}
      >
        {/* Projections Summary */}
        <motion.div
          className="bg-[#1e293b]/50 backdrop-blur-xl border border-white/10 shadow-2xl rounded-lg p-6"
          whileHover={{ scale: 1.02, boxShadow: '0 0 20px rgba(0, 112, 243, 0.3)' }}
          transition={{ duration: 0.3 }}
        >
          <h3 className="text-lg font-bold mb-4">Business Projections</h3>
          <div className="grid grid-cols-2 gap-4">
            <div className="bg-[#0f172a]/50 rounded-lg p-4 text-center">
              <DollarSign className="text-[#0070f3] mx-auto mb-2" size={24} />
              <p className="text-2xl font-bold text-[#0070f3]">${projectedRevenue.toLocaleString()}</p>
              <p className="text-sm text-gray-400">Projected Revenue</p>
            </div>
            <div className="bg-[#0f172a]/50 rounded-lg p-4 text-center">
              <TrendingUp className="text-green-400 mx-auto mb-2" size={24} />
              <p className="text-2xl font-bold text-green-400">{projectedGrowth}%</p>
              <p className="text-sm text-gray-400">Growth Rate</p>
            </div>
          </div>
        </motion.div>

        {/* Revenue Chart */}
        <motion.div
          className="bg-[#1e293b]/50 backdrop-blur-xl border border-white/10 shadow-2xl rounded-lg p-6"
          whileHover={{ scale: 1.02, boxShadow: '0 0 20px rgba(0, 112, 243, 0.3)' }}
          transition={{ duration: 0.3 }}
        >
          <h3 className="text-lg font-bold mb-4">Revenue Forecast</h3>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={revenueData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                <XAxis dataKey="month" stroke="#9ca3af" />
                <YAxis stroke="#9ca3af" />
                <Tooltip
                  contentStyle={{
                    backgroundColor: '#1e293b',
                    border: '1px solid #374151',
                    borderRadius: '8px'
                  }}
                />
                <Line
                  type="monotone"
                  dataKey="current"
                  stroke="#6b7280"
                  strokeWidth={2}
                  name="Current"
                />
                <Line
                  type="monotone"
                  dataKey="projected"
                  stroke="#0070f3"
                  strokeWidth={3}
                  name="Projected"
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </motion.div>

        {/* Budget Allocation Pie Chart */}
        <motion.div
          className="bg-[#1e293b]/50 backdrop-blur-xl border border-white/10 shadow-2xl rounded-lg p-6"
          whileHover={{ scale: 1.02, boxShadow: '0 0 20px rgba(0, 112, 243, 0.3)' }}
          transition={{ duration: 0.3 }}
        >
          <h3 className="text-lg font-bold mb-4">Budget Allocation</h3>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={pieData}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={100}
                  paddingAngle={5}
                  dataKey="value"
                >
                  {pieData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip
                  contentStyle={{
                    backgroundColor: '#1e293b',
                    border: '1px solid #374151',
                    borderRadius: '8px'
                  }}
                />
              </PieChart>
            </ResponsiveContainer>
          </div>
          <div className="flex flex-wrap justify-center gap-4 mt-4">
            {pieData.map((entry, index) => (
              <div key={index} className="flex items-center space-x-2">
                <div
                  className="w-3 h-3 rounded-full"
                  style={{ backgroundColor: entry.color }}
                ></div>
                <span className="text-sm text-gray-300">{entry.name}: ${entry.value}</span>
              </div>
            ))}
          </div>
        </motion.div>
      </motion.div>
    </div>
  );
}
