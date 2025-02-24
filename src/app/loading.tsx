'use client'
import { motion } from 'framer-motion'

const Loading = () => {
  const text = "Instant App Maker"
  
  const letterVariants = {
    initial: { opacity: 0, y: 20 },
    animate: (i: number) => ({
      opacity: 1,
      y: 0,
      transition: {
        duration: 0.6,
        delay: i * 0.05,
        ease: [0.215, 0.61, 0.355, 1],
        repeat: Infinity,
        repeatType: "reverse",
        repeatDelay: 0.5
      },
    }),
  }

  return (
    <div className='flex flex-col justify-center items-center h-screen bg-gradient-to-b from-indigo-200 to-purple-200'>
      <div className='flex overflow-hidden mb-8'>
        {text.split('').map((char, i) => (
          <motion.span
            key={i}
            variants={letterVariants as any}
            initial="initial"
            animate="animate"
            custom={i}
            className='text-4xl md:text-6xl font-bold inline-block'
            style={{
              background: 'linear-gradient(135deg, #4f46e5, #9333ea)',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
            }}
          >
            {char === " " ? "\u00A0" : char}
          </motion.span>
        ))}
      </div>

      <motion.div 
        className="h-1 bg-gradient-to-r from-indigo-600 via-purple-600 to-purple-600 rounded-full"
        initial={{ width: 0 }}
        animate={{ width: 200 }}
        transition={{
          duration: 1.5,
          repeat: Infinity,
          ease: "easeInOut",
        }}
      />
    </div>
  )
}

export default Loading