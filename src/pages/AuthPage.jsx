import { useState } from 'react'
import { LoginForm } from '../components/Auth/LoginForm'
import { RegisterForm } from '../components/Auth/RegisterForm'
import { ForgotPasswordForm } from '../components/Auth/ForgotPasswordForm'

export default function AuthPage() {
  const [mode, setMode] = useState('login')

  if (mode === 'login') return <LoginForm onToggleForm={(m) => setMode(m === 'forgot-password' ? 'forgot' : m)} />
  if (mode === 'register') return <RegisterForm onToggleForm={setMode} />
  if (mode === 'forgot') return <ForgotPasswordForm onToggleForm={setMode} />
}
