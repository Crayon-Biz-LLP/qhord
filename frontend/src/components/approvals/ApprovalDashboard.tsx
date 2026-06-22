"use client";

import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { 
  Clock, CheckCircle, XCircle, Users, Target, Mail, Calendar, AlertTriangle, 
  ChevronRight, ArrowRight, Activity, Layers, Zap, ShieldCheck, Bot, Eye, Edit, Trash2,
  Filter, Search, MoreHorizontal, TrendingUp, BarChart3, DollarSign
} from "lucide-react";
import { Loader } from "../ui/Loader";
import { api } from "../../lib/api";

interface Campaign {
  id: string;
  name: string;
  description: string;
  client: any;
  estimated_cost: number;
  estimated_duration: number;
  step_count: number;
  created_by: any;
  submitted_by: any;
  submitted_at: string;
  manifest: any;
}

export function ApprovalDashboard() {
  const [campaigns, setCampaigns] = useState<Campaign[]>([]);
  const [selectedCampaign, setSelectedCampaign] = useState<Campaign | null>(null);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [filterStatus, setFilterStatus] = useState("all");

  useEffect(() => {
    fetchPendingCampaigns();
  }, []);

  const fetchPendingCampaigns = async () => {
    try {
      const response = await api.get("/approvals/pending");
      const data = response.data;
      
      if (data.success) {
        setCampaigns(data.campaigns);
      }
    } catch (error: any) {
      if (error.response?.status === 401) {
        localStorage.removeItem("auth_token");
        localStorage.removeItem("user");
        window.location.reload();
        return;
      }
      console.error('Error fetching pending campaigns:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleApprove = async (campaignId: string, comments?: string) => {
    try {
      console.log('🔄 Approving campaign:', { campaignId, comments });
      
      const response = await api.post("/approvals/review", {
        campaignId,
        action: "approve",
        comments
      });

      const data = response.data;
      console.log('📊 Approval response:', data);
      
      if (data.success) {
        console.log('✅ Campaign approved successfully');
        fetchPendingCampaigns(); // Refresh the list
        setSelectedCampaign(null);
      } else {
        console.log('❌ Approval failed:', data.error);
        alert(`Approval failed: ${data.error}`);
      }
    } catch (error: any) {
      if (error.response?.status === 401) {
        alert("Session expired. Please login again.");
        localStorage.removeItem("auth_token");
        localStorage.removeItem("user");
        window.location.reload();
        return;
      }
      console.error('❌ Error approving campaign:', error);
      alert(`Error approving campaign: ${error.response?.data?.error || error.message}`);
    }
  };

  const handleReject = async (campaignId: string, comments: string) => {
    try {
      console.log('🔄 Rejecting campaign:', { campaignId, comments });
      
      const response = await api.post("/approvals/review", {
        campaignId,
        action: "reject",
        comments
      });

      const data = response.data;
      console.log('📊 Rejection response:', data);
      
      if (data.success) {
        console.log('✅ Campaign rejected successfully');
        fetchPendingCampaigns(); // Refresh the list
        setSelectedCampaign(null);
      } else {
        console.log('❌ Rejection failed:', data.error);
        alert(`Rejection failed: ${data.error}`);
      }
    } catch (error: any) {
      if (error.response?.status === 401) {
        alert("Session expired. Please login again.");
        localStorage.removeItem("auth_token");
        localStorage.removeItem("user");
        window.location.reload();
        return;
      }
      console.error('❌ Error rejecting campaign:', error);
      alert(`Error rejecting campaign: ${error.response?.data?.error || error.message}`);
    }
  };

  const filteredCampaigns = campaigns.filter(campaign => {
    const matchesSearch = campaign.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         campaign.description?.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesSearch;
  });

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader size={36} />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Campaign Approvals</h2>
          <p className="text-gray-500">Review and approve pending campaigns</p>
        </div>
        <div className="flex items-center gap-3">
          <div className="bg-orange-100 text-orange-800 px-3 py-1 rounded-full text-sm font-medium">
            {campaigns.length} Pending
          </div>
        </div>
      </div>

      {/* Search and Filter */}
      <div className="flex items-center gap-4">
        <div className="flex-1 relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
          <input
            type="text"
            placeholder="Search campaigns..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-brand-gold focus:border-transparent"
          />
        </div>
        <button className="flex items-center gap-2 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50">
          <Filter className="w-4 h-4" />
          Filter
        </button>
      </div>

      {/* Campaigns Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {filteredCampaigns.map((campaign, index) => (
          <motion.div
            key={campaign.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1 }}
            className="bg-white border border-gray-200 rounded-xl p-6 hover:shadow-lg transition-shadow"
          >
            {/* Campaign Header */}
            <div className="flex items-start justify-between mb-4">
              <div className="flex-1">
                <h3 className="text-lg font-bold text-gray-900 mb-2">{campaign.name}</h3>
                <p className="text-gray-600 text-sm line-clamp-2">{campaign.description}</p>
              </div>
            </div>

            {/* Campaign Details */}
            <div className="grid grid-cols-2 gap-4 mb-4">
              <div className="flex items-center gap-2">
                <DollarSign className="w-4 h-4 text-green-600" />
                <span className="text-sm font-medium">${campaign.estimated_cost}</span>
              </div>
              <div className="flex items-center gap-2">
                <Clock className="w-4 h-4 text-blue-600" />
                <span className="text-sm font-medium">{campaign.estimated_duration} min</span>
              </div>
              <div className="flex items-center gap-2">
                <Layers className="w-4 h-4 text-purple-600" />
                <span className="text-sm font-medium">{campaign.step_count} steps</span>
              </div>
              <div className="flex items-center gap-2">
                <Target className="w-4 h-4 text-orange-600" />
                <span className="text-sm font-medium">{campaign.client?.name}</span>
              </div>
            </div>

            {/* Submitted Info */}
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-full bg-gray-200 flex items-center justify-center">
                  <Users className="w-4 h-4 text-gray-600" />
                </div>
                <div>
                  <p className="text-sm font-medium">{campaign.submitted_by?.name}</p>
                  <p className="text-xs text-gray-500">
                    {new Date(campaign.submitted_at).toLocaleDateString()}
                  </p>
                </div>
              </div>
              <div />
            </div>

            {/* LangGraph Status */}
            <div className="bg-blue-50 rounded-lg p-3 mb-4">
              <div className="flex items-center gap-2 mb-2">
                <Activity className="w-4 h-4 text-blue-600" />
                <span className="text-sm font-medium text-blue-900">LangGraph Status</span>
              </div>
              <div className="grid grid-cols-4 gap-1 text-xs">
                <div className="text-center p-1 bg-green-200 rounded">
                  <div className="font-bold text-green-800">✅</div>
                </div>
                <div className="text-center p-1 bg-yellow-200 rounded">
                  <div className="font-bold text-yellow-800">✅</div>
                </div>
                <div className="text-center p-1 bg-blue-200 rounded">
                  <div className="font-bold text-blue-800">✅</div>
                </div>
                <div className="text-center p-1 bg-purple-200 rounded">
                  <div className="font-bold text-purple-800">✅</div>
                </div>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex items-center gap-3">
              <button
                onClick={() => setSelectedCampaign(campaign)}
                className="flex-1 flex items-center justify-center gap-2 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
              >
                <Eye className="w-4 h-4" />
                Review Details
              </button>
              <button
                onClick={() => handleApprove(campaign.id)}
                className="flex-1 flex items-center justify-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
              >
                <CheckCircle className="w-4 h-4" />
                Approve
              </button>
              <button
                onClick={() => handleReject(campaign.id, "Rejected by manager")}
                className="flex-1 flex items-center justify-center gap-2 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
              >
                <XCircle className="w-4 h-4" />
                Reject
              </button>
            </div>
          </motion.div>
        ))}
      </div>

      {/* Empty State */}
      {filteredCampaigns.length === 0 && (
        <div className="text-center py-12">
          <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <CheckCircle className="w-8 h-8 text-gray-400" />
          </div>
          <h3 className="text-lg font-medium text-gray-900 mb-2">No Pending Campaigns</h3>
          <p className="text-gray-500">All campaigns have been reviewed. Great job!</p>
        </div>
      )}

      {/* Campaign Detail Modal */}
      {selectedCampaign && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-xl font-bold">{selectedCampaign.name}</h3>
                <button
                  onClick={() => setSelectedCampaign(null)}
                  className="text-gray-500 hover:text-gray-700"
                >
                  ×
                </button>
              </div>
              
              <div className="space-y-4">
                <div>
                  <h4 className="font-medium mb-2">Description</h4>
                  <p className="text-gray-600">{selectedCampaign.description}</p>
                </div>
                
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <h4 className="font-medium mb-2">Cost</h4>
                    <p className="text-green-600 font-bold">${selectedCampaign.estimated_cost}</p>
                  </div>
                  <div>
                    <h4 className="font-medium mb-2">Duration</h4>
                    <p className="text-blue-600 font-bold">{selectedCampaign.estimated_duration} min</p>
                  </div>
                </div>

                <div>
                  <h4 className="font-medium mb-2">Campaign Steps</h4>
                  <div className="space-y-2">
                    {selectedCampaign.manifest?.steps?.map((step: any, index: number) => (
                      <div key={step.id} className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                        <div className="w-6 h-6 rounded-full bg-brand-gold text-white flex items-center justify-center text-xs font-bold">
                          {index + 1}
                        </div>
                        <div className="flex-1">
                          <div className="font-medium">{step.tool} → {step.action}</div>
                          <div className="text-sm text-gray-500">{step.estimated_time} min</div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
              
              <div className="flex items-center gap-3 mt-6">
                <button
                  onClick={() => {
                    handleApprove(selectedCampaign.id);
                    setSelectedCampaign(null);
                  }}
                  className="flex-1 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700"
                >
                  Approve Campaign
                </button>
                <button
                  onClick={() => setSelectedCampaign(null)}
                  className="flex-1 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50"
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
