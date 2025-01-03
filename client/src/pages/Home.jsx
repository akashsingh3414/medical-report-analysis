import React from 'react'
import { useSelector } from 'react-redux'
import { useNavigate } from 'react-router-dom'
import { ArrowUpTrayIcon, ChartBarIcon, BeakerIcon, UserIcon } from '@heroicons/react/24/outline'
import Upload from '../components/Upload'

export default function Home() {

  const user = useSelector((state)=>state.user)
  const navigate = useNavigate()

  const handleLogin = async (e) => {
    e.preventDefault();
    navigate('/getstarted')
  };
  
  return (
    <div className="min-h-screen bg-gradient-to-b from-blue-50 to-white">
      <section className="container mx-auto px-4 py-20 text-center">
        <h1 className="text-5xl font-bold text-blue-900 mb-6">
          Understand Your Blood Reports with AI
        </h1>
        <p className="text-xl text-gray-700 mb-8">
          Upload your medical reports and get instant, easy-to-understand insights powered by AI.
        </p>
        {user?.currentUser ? <Upload /> : 
        <button className="bg-blue-500 hover:bg-blue-600 text-white font-bold py-3 px-6 rounded-lg text-lg hover:scale-105" onClick={handleLogin}>Get Started</button>}
      </section>

      <section className="bg-white py-10">
        <div className="container mx-auto px-4">
          <h2 className="text-3xl font-bold text-center text-blue-900 mb-12">Key Features</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <FeatureCard 
              icon={<ArrowUpTrayIcon className="h-12 w-12 text-blue-500" />}
              title="Easy Upload"
              description="Securely upload your medical reports in various formats."
            />
            <FeatureCard 
              icon={<ChartBarIcon className="h-12 w-12 text-blue-500" />}
              title="AI Analysis"
              description="Get comprehensive insights from our advanced AI algorithms."
            />
            <FeatureCard 
              icon={<BeakerIcon className="h-12 w-12 text-blue-500" />}
              title="Simplified Results"
              description="Receive easy-to-understand explanations of your test results."
            />
          </div>
        </div>
      </section>

      <section className="container mx-auto px-4 py-10">
        <h2 className="text-3xl font-bold text-center text-blue-900 mb-12">How It Works</h2>
        <div className="flex flex-col md:flex-row justify-center items-center space-y-8 md:space-y-0 md:space-x-8">
          <StepCard number={1} text="Upload your medical reports" />
          <StepCard number={2} text="Our AI analyzes the data" />
          <StepCard number={3} text="Receive simplified insights" />
        </div>
      </section>

      <section className="container mx-auto px-4 py-10 text-center">
        <h2 className="text-3xl font-bold text-blue-900 mb-6">
          Ready to Understand Your Reports Better?
        </h2>
        <p className="text-xl text-gray-700 mb-8">
          Join thousands of users who have already benefited from our AI-powered insights.
        </p>
      </section>
    </div>
  )
}

function FeatureCard({ icon, title, description }) {
  return (
    <div className="bg-blue-50 p-6 rounded-lg text-center">
      <div className="flex justify-center mb-4">{icon}</div>
      <h3 className="text-xl font-semibold text-blue-900 mb-2">{title}</h3>
      <p className="text-gray-700">{description}</p>
    </div>
  )
}

function StepCard({ number, text }) {
  return (
    <div className="bg-blue-50 p-6 rounded-lg text-center w-64">
      <div className="bg-blue-500 text-white rounded-full w-12 h-12 flex items-center justify-center mx-auto mb-4 text-2xl font-bold">
        {number}
      </div>
      <p className="text-gray-700">{text}</p>
    </div>
  )
}

