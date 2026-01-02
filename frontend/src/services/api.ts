import axios from 'axios';
import { AnalysisResults, ProcessingStatus, AnalysisSettings } from '../types';

const API_BASE = '/api';

export const api = {
  // Upload video
  async uploadVideo(
    file: File,
    onProgress?: (progress: number) => void
  ): Promise<{ videoId: string; filename: string }> {
    const formData = new FormData();
    formData.append('file', file);

    const response = await axios.post(`${API_BASE}/upload`, formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
      onUploadProgress: (progressEvent) => {
        if (progressEvent.total && onProgress) {
          const progress = Math.round((progressEvent.loaded * 100) / progressEvent.total);
          onProgress(progress);
        }
      },
    });

    return response.data;
  },

  // Start processing
  async startProcessing(
    videoId: string,
    settings: AnalysisSettings
  ): Promise<{ jobId: string }> {
    const response = await axios.post(`${API_BASE}/process/${videoId}`, settings);
    return response.data;
  },

  // Get processing status
  async getProcessingStatus(jobId: string): Promise<ProcessingStatus> {
    const response = await axios.get(`${API_BASE}/status/${jobId}`);
    return response.data;
  },

  // Get analysis results
  async getResults(videoId: string): Promise<AnalysisResults> {
    const response = await axios.get(`${API_BASE}/results/${videoId}`);
    return response.data;
  },

  // Export results
  async exportResults(
    videoId: string,
    format: 'json' | 'csv' | 'pdf'
  ): Promise<Blob> {
    const response = await axios.get(`${API_BASE}/export/${videoId}`, {
      params: { format },
      responseType: 'blob',
    });
    return response.data;
  },

  // Get annotated video stream URL
  getAnnotatedVideoUrl(videoId: string): string {
    return `${API_BASE}/video/${videoId}/annotated`;
  },
};
