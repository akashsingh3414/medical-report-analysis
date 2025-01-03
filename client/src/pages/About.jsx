import React from 'react'

function About() {
  return (
    <div className="max-w-4xl mx-auto px-4 py-12">
      <h1 className="text-3xl font-bold mb-6">About BloodAnalytics</h1>
      <div className="bg-white rounded-lg shadow-sm p-6 space-y-4">
        <p className="text-gray-700">
          BloodAnalytics is a cutting-edge SaaS platform designed to revolutionize how blood reports are analyzed. 
          Leveraging the power of AI and the latest advancements in technology, including Google GEMINI, 
          we provide precise, actionable insights into your health, empowering you with knowledge like never before.
        </p>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-8">
          <div className="bg-blue-50 p-6 rounded-lg">
            <h3 className="text-xl font-semibold mb-3">Our Mission</h3>
            <p className="text-gray-600">
              To harness the power of AI to make blood report analysis simple, accurate, and accessible, 
              helping users understand their health better and take informed actions.
            </p>
          </div>
          <div className="bg-green-50 p-6 rounded-lg">
            <h3 className="text-xl font-semibold mb-3">Our Vision</h3>
            <p className="text-gray-600">
              To lead the future of healthcare by integrating the newest technologies like Google GEMINI 
              and AI-driven insights, making health data analysis seamless and universally available.
            </p>
          </div>
        </div>
        <div className="bg-yellow-50 p-6 rounded-lg mt-8">
          <h3 className="text-xl font-semibold mb-3">Why Choose BloodAnalytics?</h3>
          <ul className="list-disc list-inside text-gray-600">
            <li>State-of-the-art AI integration for unparalleled accuracy.</li>
            <li>Seamless analysis of blood reports in seconds.</li>
            <li>Empowering users with clear, actionable health insights.</li>
            <li>Secure and reliable SaaS platform accessible globally.</li>
          </ul>
        </div>
      </div>
    </div>
  )
}

export default About
