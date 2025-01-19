'use client'

import { useState } from 'react'
import { Dialog } from '@headlessui/react'
import { Bars3Icon, XMarkIcon } from '@heroicons/react/24/outline'
import { motion } from 'framer-motion'

export default function AdminDashboard() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)

  return (
    <>
      {/* SEO Meta Tags */}
      <head>
        <title>Elastomech Rubber - Superior Rubber Products</title>
        <meta name="description" content="Elastomech Rubber Company specializes in crafting superior Rubber Fenders and diverse Rubber Products, setting industry standards." />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <meta name="robots" content="index, follow" />
      </head>

      {/* Hero Section */}
      <section className="bg-white dark:bg-white py-16 lg:py-24">
        <div className="grid max-w-screen-xl px-4 py-8 mx-auto lg:gap-8 xl:gap-0 lg:py-16 lg:grid-cols-12">
          <div className="mr-auto place-self-center lg:col-span-7">
            <motion.h1
              className="max-w-2xl mb-4 text-4xl font-extrabold tracking-tight leading-none md:text-5xl xl:text-6xl text-indigo-600 dark:text-black"
              initial={{ opacity: 0, y: -50 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 1 }}
            >
              Welcome to Elastomech, You Imagine, We Create
            </motion.h1>
            <motion.p
              className="max-w-2xl mb-6 font-light text-gray-500 lg:mb-8 md:text-lg lg:text-xl dark:text-gray-400"
              initial={{ opacity: 0, y: -50 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 1, delay: 0.2 }}
            >
              At Elastomech, we specialize in crafting superior Rubber Fenders and a diverse array of Rubber Products, setting the standard for excellence in the industry.
            </motion.p>

            
          </div>
          <div className="hidden lg:mt-0 lg:col-span-5 lg:flex">
            <motion.img
              src="https://elastomech.in/img/company%20image.jpg"
              alt="Elastomech Products"
              className="w-full h-auto rounded-xl shadow-lg"
              initial={{ opacity: 0, x: 50 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 1, delay: 0.4 }}
            />
          </div>
        </div>
      </section>

      {/* Mobile Menu */}
      <div className="lg:hidden">
        <button
          type="button"
          onClick={() => setMobileMenuOpen(true)}
          className="text-gray-500 hover:text-gray-700 focus:outline-none"
        >
          <Bars3Icon className="h-6 w-6" />
        </button>
        <Dialog open={mobileMenuOpen} onClose={() => setMobileMenuOpen(false)}>
          <Dialog.Panel className="fixed inset-0 bg-gray-800 bg-opacity-75 p-4">
            <div className="flex justify-between items-center">
              <button
                onClick={() => setMobileMenuOpen(false)}
                className="text-white"
              >
                <XMarkIcon className="h-6 w-6" />
              </button>
            </div>
            
          </Dialog.Panel>
        </Dialog>
      </div>
    </>
  )
}
