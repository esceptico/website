'use client';

import { motion } from 'framer-motion';
import { EnvelopeIcon, MapPinIcon } from '@heroicons/react/24/outline';
import { FaGithub, FaLinkedin, FaTwitter } from 'react-icons/fa';

export default function Contact() {
  return (
    <div className="min-h-screen p-8 bg-gray-950">
      <div className="max-w-7xl mx-auto px-4 py-12 sm:px-6 lg:px-8">
        <div className="space-y-4">
          <h1 className="text-4xl font-light text-gray-200">
            Contact
            <span className="block text-xl mt-2 text-indigo-400">Let's Connect</span>
          </h1>
          <p className="text-gray-400 max-w-3xl">
            I'm always interested in hearing about new projects and opportunities.
            Feel free to reach out through any of the channels below.
          </p>
        </div>

        <div className="mt-12 grid gap-8 md:grid-cols-2">
          {/* Contact Information */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4 }}
            className="space-y-8"
          >
            <div className="bg-gray-900/50 backdrop-blur-sm p-6 rounded-xl border border-gray-800">
              <div className="flex items-center gap-4 mb-4">
                <EnvelopeIcon className="h-6 w-6 text-indigo-400" />
                <h3 className="text-xl font-semibold text-gray-200">Email</h3>
              </div>
              <a
                href="mailto:contact@example.com"
                className="text-gray-400 hover:text-indigo-400 transition-colors"
              >
                contact@example.com
              </a>
            </div>

            <div className="bg-gray-900/50 backdrop-blur-sm p-6 rounded-xl border border-gray-800">
              <div className="flex items-center gap-4 mb-4">
                <MapPinIcon className="h-6 w-6 text-indigo-400" />
                <h3 className="text-xl font-semibold text-gray-200">Location</h3>
              </div>
              <p className="text-gray-400">San Francisco, CA</p>
            </div>

            <div className="bg-gray-900/50 backdrop-blur-sm p-6 rounded-xl border border-gray-800">
              <h3 className="text-xl font-semibold text-gray-200 mb-4">Social Media</h3>
              <div className="flex gap-4">
                <a
                  href="https://github.com"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-gray-400 hover:text-indigo-400 transition-colors"
                >
                  <FaGithub className="h-6 w-6" />
                </a>
                <a
                  href="https://linkedin.com"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-gray-400 hover:text-indigo-400 transition-colors"
                >
                  <FaLinkedin className="h-6 w-6" />
                </a>
                <a
                  href="https://twitter.com"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-gray-400 hover:text-indigo-400 transition-colors"
                >
                  <FaTwitter className="h-6 w-6" />
                </a>
              </div>
            </div>
          </motion.div>

          {/* Contact Form */}
          <motion.form
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, delay: 0.2 }}
            className="bg-gray-900/50 backdrop-blur-sm p-6 rounded-xl border border-gray-800 space-y-6"
          >
            <div>
              <label htmlFor="name" className="block text-sm font-medium text-gray-300">
                Name
              </label>
              <input
                type="text"
                id="name"
                name="name"
                className="mt-1 block w-full rounded-md bg-gray-800 border-gray-700 text-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
              />
            </div>

            <div>
              <label htmlFor="email" className="block text-sm font-medium text-gray-300">
                Email
              </label>
              <input
                type="email"
                id="email"
                name="email"
                className="mt-1 block w-full rounded-md bg-gray-800 border-gray-700 text-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
              />
            </div>

            <div>
              <label htmlFor="message" className="block text-sm font-medium text-gray-300">
                Message
              </label>
              <textarea
                id="message"
                name="message"
                rows={4}
                className="mt-1 block w-full rounded-md bg-gray-800 border-gray-700 text-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
              />
            </div>

            <button
              type="submit"
              className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 focus:ring-offset-gray-900"
            >
              Send Message
            </button>
          </motion.form>
        </div>
      </div>
    </div>
  );
} 