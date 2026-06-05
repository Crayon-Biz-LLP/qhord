"use client";

import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { 
  Cpu, Activity, Zap, Clock, CheckCircle, AlertTriangle, 
  TrendingUp, BarChart3, Settings, RefreshCw, Play, Pause,
  Database, Globe, Target, Layers, Sparkles, Bot
} from "lucide-react";
import { useAuth } from "../../../hooks/useAuth";
import { api } from "../../../lib/api";
import { Loader } from "../../../components/ui/Loader";

export default function AIEnginePage() {
  const { user } = useAuth(true);
  const [metrics, setMetrics] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    fetchMetrics();
  }, []);

  const fetchMetrics = async () => {
    try {
      const response = await api.get("/ai-engine/metrics");
      if (response.data.success) {
        setMetrics(response.data.metrics);
      }
    } catch (error) {
      console.error('Failed to fetch AI Engine metrics:', error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const handleRefresh = () => {
    setRefreshing(true);
    fetchMetrics();
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader size={36} />
      </div>
    );
  }

  return (
    <div className="p-8 space-y-8">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-[#1a1510]">AI Engine</h1>
          <p className="text-gray-600 mt-2">LangGraph AI processing performance and metrics</p>
        </div>
        <button
          onClick={handleRefresh}
          disabled={refreshing}
          className="flex items-center gap-2 px-4 py-2 bg-brand-gold text-[#1a1510] rounded-lg hover:bg-brand-gold/90 disabled:opacity-50"
        >
          <RefreshCw className={`w-4 h-4 ${refreshing ? 'animate-spin' : ''}`} />
          Refresh
        </button>
      </div>

      {/* Status Overview */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white p-6 rounded-xl border border-gray-200"
        >
          <div className="flex items-center justify-between mb-4">
            <Cpu className="w-8 h-8 text-brand-gold" />
            <span className={`px-2 py-1 rounded-full text-xs font-medium ${
              metrics?.status === 'Optimal' ? 'bg-green-100 text-green-800' :
              metrics?.status === 'Good' ? 'bg-yellow-100 text-yellow-800' :
              'bg-red-100 text-red-800'
            }`}>
              {metrics?.status || 'Unknown'}
            </span>
          </div>
          <h3 className="text-2xl font-bold text-[#1a1510]">{metrics?.totalCampaigns || 0}</h3>
          <p className="text-gray-600 text-sm mt-1">Total Campaigns</p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="bg-white p-6 rounded-xl border border-gray-200"
        >
          <div className="flex items-center justify-between mb-4">
            <Activity className="w-8 h-8 text-blue-500" />
            <span className="text-xs text-gray-500">Last 30 days</span>
          </div>
          <h3 className="text-2xl font-bold text-[#1a1510]">{metrics?.totalExecutions || 0}</h3>
          <p className="text-gray-600 text-sm mt-1">Total Executions</p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="bg-white p-6 rounded-xl border border-gray-200"
        >
          <div className="flex items-center justify-between mb-4">
            <CheckCircle className="w-8 h-8 text-green-500" />
            <span className="text-xs text-gray-500">Success rate</span>
          </div>
          <h3 className="text-2xl font-bold text-[#1a1510]">{metrics?.successRate || 0}%</h3>
          <p className="text-gray-600 text-sm mt-1">Processing Success</p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="bg-white p-6 rounded-xl border border-gray-200"
        >
          <div className="flex items-center justify-between mb-4">
            <Clock className="w-8 h-8 text-purple-500" />
            <span className="text-xs text-gray-500">Average</span>
          </div>
          <h3 className="text-2xl font-bold text-[#1a1510]">{metrics?.avgProcessingTime || 0}s</h3>
          <p className="text-gray-600 text-sm mt-1">Processing Time</p>
        </motion.div>
      </div>

      {/* Node Performance */}
      <div className="bg-white rounded-xl border border-gray-200 p-6">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-bold text-[#1a1510]">Node Performance</h2>
          <Layers className="w-5 h-5 text-gray-400" />
        </div>
        
        <div className="space-y-4">
          {metrics?.nodePerformance?.map((node: any, index: number) => (
            <motion.div
              key={node.node}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: index * 0.1 }}
              className="flex items-center justify-between p-4 bg-gray-50 rounded-lg"
            >
              <div className="flex items-center gap-4">
                <div className="w-10 h-10 bg-brand-gold rounded-lg flex items-center justify-center">
                  <Bot className="w-5 h-5 text-[#1a1510]" />
                </div>
                <div>
                  <h3 className="font-semibold text-[#1a1510]">{node.node} Node</h3>
                  <p className="text-sm text-gray-600">
                    {node.totalExecutions} executions • {node.avgTime}s avg time
                  </p>
                </div>
              </div>
              
              <div className="flex items-center gap-6">
                <div className="text-right">
                  <p className="text-sm text-gray-600">Success Rate</p>
                  <p className="font-semibold text-[#1a1510]">{node.successRate}%</p>
                </div>
                <div className="w-20 h-2 bg-gray-200 rounded-full overflow-hidden">
                  <div 
                    className="h-full bg-brand-gold rounded-full"
                    style={{ width: `${node.successRate}%` }}
                  />
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </div>

      {/* System Health */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-white rounded-xl border border-gray-200 p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-bold text-[#1a1510]">System Health</h2>
            <Activity className="w-5 h-5 text-gray-400" />
          </div>
          
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-gray-600">Uptime</span>
              <span className="font-semibold text-[#1a1510]">{metrics?.uptime || 0}%</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-gray-600">Memory Usage</span>
              <span className="font-semibold text-green-600">Normal</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-gray-600">API Response</span>
              <span className="font-semibold text-green-600">Fast</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-gray-600">Database</span>
              <span className="font-semibold text-green-600">Connected</span>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl border border-gray-200 p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-bold text-[#1a1510]">Recent Activity</h2>
            <Clock className="w-5 h-5 text-gray-400" />
          </div>
          
          <div className="space-y-3">
            <div className="flex items-center gap-3 text-sm">
              <div className="w-2 h-2 bg-green-500 rounded-full"></div>
              <span className="text-gray-600">Parser node completed campaign processing</span>
              <span className="text-gray-400">2m ago</span>
            </div>
            <div className="flex items-center gap-3 text-sm">
              <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
              <span className="text-gray-600">Architect node generated campaign plan</span>
              <span className="text-gray-400">5m ago</span>
            </div>
            <div className="flex items-center gap-3 text-sm">
              <div className="w-2 h-2 bg-purple-500 rounded-full"></div>
              <span className="text-gray-600">Validator node approved campaign manifest</span>
              <span className="text-gray-400">8m ago</span>
            </div>
            <div className="flex items-center gap-3 text-sm">
              <div className="w-2 h-2 bg-yellow-500 rounded-full"></div>
              <span className="text-gray-600">Executor node started campaign execution</span>
              <span className="text-gray-400">12m ago</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
