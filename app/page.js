'use client'

import { Box, Button, CircularProgress, Stack, TextField, Typography } from '@mui/material'
import { useState } from 'react'
import { motion } from 'framer-motion'

export default function Home() {
  const [messages, setMessages] = useState([])
  const [message, setMessage] = useState('')
  const [loading, setLoading] = useState(false)

  const sendMessage = async () => {
    if (!message.trim()) return

    const newMessages = [
      ...messages,
      {
        role: 'user',
        content: message,
      },
    ]
    setMessages(newMessages)
    setMessage('')
    setLoading(true)

    try {
      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ userMessage: message }),
      })

      const data = await response.json()
      if (response.ok) {
        setMessages([
          ...newMessages,
          {
            role: 'assistant',
            content: data.message,
          },
        ])
      } else {
        setMessages([
          ...newMessages,
          {
            role: 'assistant',
            content: 'Sorry, something went wrong. Please try again later.',
          },
        ])
      }
    } catch (error) {
      setMessages([
        ...newMessages,
        {
          role: 'assistant',
          content: 'Error communicating with the server.',
        },
      ])
    } finally {
      setLoading(false)
    }
  }

  return (
    <Box
      width="100vw"
      height="100vh"
      display="flex"
      flexDirection="column"
      alignItems="center"
      justifyContent="center"
      bgcolor="linear-gradient(135deg, #001F3F, #00132B)"
    >
      <Box
        width="100%"
        maxWidth="600px"
        height="80vh"
        borderRadius="16px"
        overflow="hidden"
        boxShadow={4}
        display="flex"
        flexDirection="column"
        bgcolor="background.paper"
      >
        <Box p={2} bgcolor="primary.main" color="white" textAlign="center">
          <Typography variant="h4">StellarisBot</Typography>
        </Box>

        <Box
          flexGrow={1}
          p={2}
          overflow="auto"
          display="flex"
          flexDirection="column"
          sx={{ '&::-webkit-scrollbar': { width: '8px' }, '&::-webkit-scrollbar-thumb': { backgroundColor: '#444' } }}
        >
          {messages.map((message, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3 }}
            >
              <Box
                display="flex"
                justifyContent={
                  message.role === 'assistant' ? 'flex-start' : 'flex-end'
                }
                mb={2}
              >
                <Box
                  bgcolor={
                    message.role === 'assistant'
                      ? 'primary.main'
                      : 'secondary.main'
                  }
                  color="white"
                  borderRadius="16px"
                  p={2}
                  maxWidth="75%"
                  boxShadow={3}
                  sx={{
                    transition: 'transform 0.3s',
                    '&:hover': {
                      transform: 'scale(1.02)',
                    },
                  }}
                >
                  {message.content}
                </Box>
              </Box>
            </motion.div>
          ))}
          {loading && (
            <Box display="flex" justifyContent="center" mt={2}>
              <CircularProgress size={24} />
            </Box>
          )}
        </Box>

        <Box
          p={2}
          borderTop="1px solid #ddd"
          bgcolor="background.default"
          display="flex"
          alignItems="center"
        >
          <TextField
            fullWidth
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            disabled={loading}
            placeholder="Type your message..."
            InputProps={{
              sx: {
                color: 'black', 
              },
            }}
            InputLabelProps={{
              sx: {
                color: 'black', 
              },
            }}
            sx={{
              '& .MuiOutlinedInput-root': {
                '& fieldset': {
                  borderColor: 'white', 
                },
                '&:hover fieldset': {
                  borderColor: 'white', 
                },
                '&.Mui-focused fieldset': {
                  borderColor: 'white', 
                },
              },
            }}
          />
          <Button
            variant="contained"
            color="primary"
            onClick={sendMessage}
            disabled={loading}
            sx={{
              ml: 2,
              transition: 'background-color 0.3s',
              '&:hover': {
                backgroundColor: '#004d99',
              },
            }}
          >
            Send
          </Button>
        </Box>
      </Box>
    </Box>
  )
}
