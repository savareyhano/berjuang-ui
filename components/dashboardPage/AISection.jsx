'use client';

import React, { useState, useEffect, useRef } from 'react';
import { Select, SelectContent, SelectGroup, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Button } from '@/components/ui/button';
import { Card } from '../ui/card';
import axios from 'axios';
import ReactMarkdown from 'react-markdown';
import useLanguageStore from '@/lib/zustand/useLanguageStore';
import langData from '@/lib/lang';

const AISection = () => {
  const [messages, setMessages] = useState({});
  const [dates, setDates] = useState([]);
  const [selectedDate, setSelectedDate] = useState('');
  const [filteredMessages, setFilteredMessages] = useState([]);
  const [loading, setLoading] = useState(false);
  const [typingMessage, setTypingMessage] = useState('');
  const messagesEndRef = useRef(null);

  const { lang } = useLanguageStore();

  useEffect(() => {
    const fetchMessages = async () => {
      setLoading(true);
      try {
        const { data } = await axios.get(`${process.env.NEXT_PUBLIC_API_URL}/ai-responses`, {
          withCredentials: true,
        });

        if (data.status === 'success') {
          const groupedMessages = data.data.aiResponses.reduce((acc, msg) => {
            const date = msg.date.split('T')[0];
            if (!acc[date]) acc[date] = [];
            acc[date].push({
              content: msg.message,
              time: new Date(msg.date).toLocaleTimeString(),
            });
            return acc;
          }, {});

          setMessages(groupedMessages);
          const uniqueDates = Object.keys(groupedMessages).sort().reverse();
          setDates(uniqueDates);
          if (uniqueDates.length > 0) setSelectedDate(uniqueDates[0]);
        }
      } catch (error) {
        console.error('Error fetching AI responses:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchMessages();
  }, []);

  useEffect(() => {
    if (selectedDate) {
      setFilteredMessages(messages[selectedDate] || []);
    }
  }, [selectedDate, messages]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [filteredMessages, loading, typingMessage]);

  const handleSubmit = async (event) => {
    event.preventDefault();
    setLoading(true);
    setTypingMessage('');

    try {
      const { data } = await axios.post(
        `${process.env.NEXT_PUBLIC_API_URL}/ai-responses`,
        {},
        { withCredentials: true }
      );

      if (data.status === 'success') {
        const newDate = new Date().toISOString().split('T')[0];
        const responseText = data.data.aiResponse;
        const sentences = responseText.match(/[^.!?]+[.!?]+/g) || [responseText];
        let currentText = '';
        let index = 0;

        const typingInterval = setInterval(() => {
          if (index < sentences.length) {
            currentText += (index === 0 ? '' : ' ') + sentences[index];
            setTypingMessage(currentText);
            index++;
          } else {
            clearInterval(typingInterval);
            const newMessage = {
              content: responseText,
              time: new Date().toLocaleTimeString(),
            };

            setMessages((prev) => {
              const updatedMessages = { ...prev, [newDate]: [...(prev[newDate] || []), newMessage] };
              setDates((d) => (d.includes(newDate) ? d : [newDate, ...d]));
              return updatedMessages;
            });

            setSelectedDate(newDate);
            setTypingMessage('');
          }
        }, 15);
      }
    } catch (error) {
      console.error('Error sending message:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card className="flex-[4] bg-transparent">
      <div className='flex justify-between items-center p-4 border-b-2 border-black'>
        <h3 className="text-xl md:text-2xl font-bold">{langData[lang].dashboardPage.askAI}</h3>
        <Select value={selectedDate} onValueChange={setSelectedDate}>
          <SelectTrigger className="bg-transparent w-fit rounded-md p-4">
            <SelectValue placeholder="Pilih Tanggal" />
          </SelectTrigger>
          <SelectContent className="bg-white shadow-md rounded-md">
            <SelectGroup>
              {dates.map((date) => (
                <SelectItem key={date} value={date}>{date}</SelectItem>
              ))}
            </SelectGroup>
          </SelectContent>
        </Select>
      </div>

      <div className="space-y-3 overflow-y-auto h-[400px] p-4 bg-white">
        {filteredMessages.map((msg, index) => (
          <div key={index} className="p-3 max-w-3xl border-2 rounded-xl bg-gray-100 text-black border-transparent">
            <ReactMarkdown>{msg.content}</ReactMarkdown>
            <div className="text-xs text-gray-500 mt-1">{msg.time}</div>
          </div>
        ))}
        {typingMessage && (
          <div className="p-3 max-w-3xl border-2 rounded-xl bg-gray-100 text-black border-transparent animate-pulse">
            <ReactMarkdown>{typingMessage}</ReactMarkdown>
          </div>
        )}
        {loading && !typingMessage && (
          <div className="p-3 max-w-3xl border-2 rounded-xl bg-gray-200 text-black border-transparent animate-pulse">
            <div className="h-4 bg-gray-300 rounded w-3/4"></div>
            <div className="h-4 bg-gray-300 rounded w-1/2 mt-2"></div>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>
      
      <form onSubmit={handleSubmit} className="flex gap-2 border-t-2 border-black p-4 justify-center">
        <Button type="submit" disabled={loading}>
          {langData[lang].dashboardPage.AIButton}
        </Button>
      </form>
    </Card>
  );
};

export default AISection;