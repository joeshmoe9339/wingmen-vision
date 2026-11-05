import React, { useState } from 'react';
import { User } from '../lib/auth';
import { Lightbulb, MessageSquare, ThumbsUp, Send } from 'lucide-react';

export default function ImprovementFeature({ user }: { user?: User }) {
  const [feedback, setFeedback] = useState('');
  const [type, setType] = useState('ai_training');
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitted(true);
    setTimeout(() => {
      setSubmitted(false);
      setFeedback('');
    }, 3000);
  };

  return (
    <div className="space-y-6 max-w-4xl">
      <div>
        <h2 className="text-xl font-bold text-white">System Improvement & AI Feedback</h2>
        <p className="text-sm text-gray-400">Help train the Wingmen Vision AI or request new features for the dashboard.</p>
      </div>

      <div className="bg-gray-900 border border-gray-800 rounded-xl p-6">
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-400 mb-2">Feedback Type</label>
            <select 
              value={type}
              onChange={(e) => setType(e.target.value)}
              className="w-full bg-black border border-gray-800 rounded-lg p-3 text-white focus:border-red-600 focus:ring-1 focus:ring-red-600 outline-none"
            >
              <option value="ai_training">AI False Positive / Accuracy Report</option>
              <option value="feature_request">Dashboard Feature Request</option>
              <option value="bug_report">Bug Report</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-400 mb-2">Details & Description</label>
            <textarea 
              value={feedback}
              onChange={(e) => setFeedback(e.target.value)}
              className="w-full bg-black border border-gray-800 rounded-lg p-3 text-white h-32 focus:border-red-600 focus:ring-1 focus:ring-red-600 outline-none"
              placeholder="Describe the issue, false positive, or feature you'd like to see..."
              required
            />
          </div>

          <button 
            type="submit"
            disabled={submitted || !feedback}
            className="bg-red-700 hover:bg-red-600 disabled:bg-green-600 text-white px-6 py-3 rounded-lg font-medium transition-colors flex items-center gap-2"
          >
            {submitted ? (
              <><ThumbsUp className="w-5 h-5" /> Received! Thank you.</>
            ) : (
              <><Send className="w-5 h-5" /> Submit Feedback</>
            )}
          </button>
        </form>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="bg-red-950/10 border border-red-600/20 rounded-xl p-5">
          <Lightbulb className="w-6 h-6 text-red-500 mb-3" />
          <h3 className="text-white font-bold mb-2">Why submit feedback?</h3>
          <p className="text-sm text-gray-400 leading-relaxed">
            Wingmen Vision uses active learning. When you report a false positive (e.g., a broom mistaken for a rifle), our engineers use that data to retrain the neural network, making the system smarter for everyone.
          </p>
        </div>
        <div className="bg-purple-900/10 border border-purple-500/20 rounded-xl p-5">
          <MessageSquare className="w-6 h-6 text-purple-400 mb-3" />
          <h3 className="text-white font-bold mb-2">Feature Requests</h3>
          <p className="text-sm text-gray-400 leading-relaxed">
            Need a new report format? Want integration with a specific camera brand? Submit a feature request. We prioritize updates based on user demand and operational impact.
          </p>
        </div>
      </div>
    </div>
  );
}
