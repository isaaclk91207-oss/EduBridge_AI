import { redirect } from 'next/navigation';

export default function SignInPage() {
  redirect('/auth?redirect=%2Fdashboard');
}
