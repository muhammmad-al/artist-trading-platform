'use client'
import React from 'react';
import { LineChart, Line, CartesianGrid, XAxis, YAxis, ResponsiveContainer, Tooltip } from 'recharts';

const generatePriceData = () => {
  const data = [];
  const basePrice = 2.5; // Base price in ETH
  
  for (let i = 0; i < 20; i++) {
    data.push({
      name: `Day ${i}`,
      price: parseFloat((basePrice + Math.sin(i * 0.5) * 0.3).toFixed(3))
    });
  }
  return data;
};

export default function PriceGraph() {
  const data = generatePriceData();

  return (
    <div style={{ width: '100%', height: 400 }}>
      <h2 className="text-xl font-bold mb-4">Drake NFT Price History</h2>
      <ResponsiveContainer>
        <LineChart data={data}>
          <Line 
            type="monotone" 
            dataKey="price" 
            stroke="#3b82f6" 
            strokeWidth={2}
            dot={false}
          />
          <CartesianGrid stroke="#333" />
          <XAxis 
            dataKey="name" 
            stroke="#666"
            tick={{ fill: '#fff' }}
          />
          <YAxis 
            stroke="#666"
            tick={{ fill: '#fff' }}
            tickFormatter={(value) => `${value} ETH`}
          />
          <Tooltip 
            contentStyle={{
              backgroundColor: '#1a1a1a',
              border: '1px solid #333',
              borderRadius: '4px',
              padding: '8px'
            }}
            labelStyle={{ color: '#999' }}
            formatter={(value) => [`${value} ETH`, 'Price']}
          />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}