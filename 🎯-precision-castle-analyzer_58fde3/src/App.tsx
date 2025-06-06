import React, { useState, useRef, useEffect } from 'react';
import { Upload, X, CheckCircle, XCircle, Filter, Download, Settings, BarChart3, Image as ImageIcon, Trash2, FileDown, AlertCircle, Shield, Target, Clock } from 'lucide-react';
import AILayer from './components/AILayer';
import { AILayerHandle } from './components/AILayer.types';
import { useAuth } from './contexts/authContext';

interface ImageAnalysis {
  id: string;
  fileName: string;
  fileSize: number;
  uploadTime: number;
  imageUrl: string;
  isCastleDetected: boolean;
  confidence: number;
  analysisTime: number;
  status: 'pending' | 'analyzing' | 'completed' | 'error';
  errorMessage?: string;
  aiReasoning?: string;
  lightingCondition?: 'daylight' | 'nighttime' | 'unknown';
  castlePosition?: 'foreground' | 'background' | 'center' | 'unknown';
}

interface AnalysisStats {
  total: number;
  castleDetected: number;
  notCastleDetected: number;
  averageConfidence: number;
  processingTime: number;
  highConfidenceDetections: number;
  daylightDetections: number;
  nighttimeDetections: number;
}

type FilterType = 'all' | 'castle' | 'no-castle' | 'high-confidence' | 'pending' | 'error';
type SortType = 'upload-time' | 'confidence' | 'filename';

const CONFIDENCE_THRESHOLD = 90;

const App: React.FC = () => {
  const { currentUser, logout } = useAuth();
  const [activeTab, setActiveTab] = useState<'upload' | 'results' | 'analytics' | 'settings'>('upload');
  const [images, setImages] = useState<ImageAnalysis[]>([]);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [filter, setFilter] = useState<FilterType>('all');
  const [sortBy, setSortBy] = useState<SortType>('upload-time');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');
  const [selectedImages, setSelectedImages] = useState<Set<string>>(new Set());
  const [showConfirmDialog, setShowConfirmDialog] = useState(false);
  const [confirmAction, setConfirmAction] = useState<(() => void) | null>(null);
  const [confirmMessage, setConfirmMessage] = useState('');
  const [currentAnalysisId, setCurrentAnalysisId] = useState<string | null>(null);

  const aiLayerRef = useRef<AILayerHandle>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Load data from localStorage on mount
  useEffect(() => {
    const savedImages = localStorage.getItem('chateau-analyzer-images');
    if (savedImages) {
      try {
        const parsedImages = JSON.parse(savedImages);
        setImages(parsedImages);
      } catch (error) {
        console.error('Error loading saved images:', error);
      }
    }
  }, []);

  // Save data to localStorage whenever images change
  useEffect(() => {
    localStorage.setItem('chateau-analyzer-images', JSON.stringify(images));
  }, [images]);

  // Handle AI Layer callbacks
  const handleAIResult = (result: string) => {
    if (!currentAnalysisId) return;
    
    try {
      const analysisResult = JSON.parse(result);
      const analysisTime = Date.now() - (images.find(img => img.id === currentAnalysisId)?.uploadTime || Date.now());
      
      setImages(prev => prev.map(img => 
        img.id === currentAnalysisId ? {
          ...img,
          isCastleDetected: analysisResult.isCastleDetected && (analysisResult.confidence >= CONFIDENCE_THRESHOLD),
          confidence: Math.min(100, Math.max(0, analysisResult.confidence || 0)),
          analysisTime,
          status: 'completed' as const,
          aiReasoning: analysisResult.reasoning || '',
          lightingCondition: analysisResult.lightingCondition || 'unknown',
          castlePosition: analysisResult.castlePosition || 'unknown'
        } : img
      ));
    } catch (error) {
      setImages(prev => prev.map(img => 
        img.id === currentAnalysisId ? {
          ...img,
          status: 'error' as const,
          errorMessage: 'Failed to parse AI analysis result'
        } : img
      ));
    }
    setCurrentAnalysisId(null);
  };

  const handleAIError = (error: any) => {
    if (!currentAnalysisId) return;
    
    setImages(prev => prev.map(img => 
      img.id === currentAnalysisId ? {
        ...img,
        status: 'error' as const,
        errorMessage: 'AI analysis failed. Please try again.'
      } : img
    ));
    setCurrentAnalysisId(null);
  };

  const handleAILoading = (loading: boolean) => {
    // Handle loading state if needed
  };

  const handleFileUpload = (files: FileList | null) => {
    if (!files) return;

    const newImages: ImageAnalysis[] = [];
    
    Array.from(files).forEach((file) => {
      if (file.type.startsWith('image/')) {
        const imageUrl = URL.createObjectURL(file);
        const newImage: ImageAnalysis = {
          id: `img-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
          fileName: file.name,
          fileSize: file.size,
          uploadTime: Date.now(),
          imageUrl,
          isCastleDetected: false,
          confidence: 0,
          analysisTime: 0,
          status: 'pending'
        };
        newImages.push(newImage);
      }
    });

    setImages(prev => [...prev, ...newImages]);
    
    // Start analyzing immediately
    if (newImages.length > 0) {
      analyzeImages(newImages);
    }
  };

  const analyzeImages = async (imagesToAnalyze: ImageAnalysis[]) => {
    setIsAnalyzing(true);

    for (const image of imagesToAnalyze) {
      try {
        // Update status to analyzing
        setImages(prev => prev.map(img => 
          img.id === image.id ? { ...img, status: 'analyzing' as const } : img
        ));

        setCurrentAnalysisId(image.id);
        
        // Convert image to file for AI analysis
        const response = await fetch(image.imageUrl);
        const blob = await response.blob();
        const file = new File([blob], image.fileName, { type: blob.type });

        const prompt = `Analyze this image with high precision to determine if it contains a castle, chateau, or fortress. Apply these enhanced detection criteria:

ARCHITECTURAL FEATURES TO DETECT:
- Stone or brick construction with defensive characteristics
- Towers, turrets, or battlements
- Crenellated walls or parapets  
- Multiple levels with medieval/palatial architecture
- Moats, drawbridges, or defensive walls
- Grand facades with symmetrical design
- Fortified entrances or gatehouses

DETECTION REQUIREMENTS:
- Detect castles regardless of size (foreground, background, or distant)
- Analyze both daylight and nighttime lighting conditions
- Consider partial views, ruins, or reconstructed castles
- Distinguish from modern buildings, churches, or regular houses
- Account for various photographic angles and perspectives

CONFIDENCE SCORING:
- Only return confidence ≥90% for definitive castle detections
- Use lower confidence (60-89%) for uncertain or ambiguous cases
- Consider architectural clarity, lighting quality, and visible features

Return JSON with this exact structure:
{
  "isCastleDetected": boolean,
  "confidence": number (0-100),
  "reasoning": "detailed explanation of architectural features identified or why not a castle",
  "lightingCondition": "daylight" or "nighttime" or "unknown",
  "castlePosition": "foreground" or "background" or "center" or "unknown"
}

Focus on precision over speed. A 90%+ confidence should indicate near-certainty of castle presence.`;

        // Call AI analysis
        aiLayerRef.current?.sendToAI(prompt, file);

        // Wait a moment before processing next image to avoid overwhelming the AI
        await new Promise(resolve => setTimeout(resolve, 1000));

      } catch (error) {
        // Handle error
        setImages(prev => prev.map(img => 
          img.id === image.id ? {
            ...img,
            status: 'error' as const,
            errorMessage: 'Analysis failed. Please try again.'
          } : img
        ));
        setCurrentAnalysisId(null);
      }
    }

    setIsAnalyzing(false);
  };

  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    handleFileUpload(e.dataTransfer.files);
  };

  const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
  };

  const deleteImage = (imageId: string) => {
    setImages(prev => {
      const updatedImages = prev.filter(img => img.id !== imageId);
      // Revoke object URL to prevent memory leaks
      const imageToDelete = prev.find(img => img.id === imageId);
      if (imageToDelete?.imageUrl) {
        URL.revokeObjectURL(imageToDelete.imageUrl);
      }
      return updatedImages;
    });
    setSelectedImages(prev => {
      const updated = new Set(prev);
      updated.delete(imageId);
      return updated;
    });
  };

  const deleteSelectedImages = () => {
    const message = `Are you sure you want to delete ${selectedImages.size} selected image(s)?`;
    setConfirmMessage(message);
    setConfirmAction(() => () => {
      selectedImages.forEach(imageId => {
        const image = images.find(img => img.id === imageId);
        if (image?.imageUrl) {
          URL.revokeObjectURL(image.imageUrl);
        }
      });
      setImages(prev => prev.filter(img => !selectedImages.has(img.id)));
      setSelectedImages(new Set());
      setShowConfirmDialog(false);
    });
    setShowConfirmDialog(true);
  };

  const clearAllData = () => {
    setConfirmMessage('Are you sure you want to delete all images and analysis results? This action cannot be undone.');
    setConfirmAction(() => () => {
      images.forEach(img => {
        if (img.imageUrl) {
          URL.revokeObjectURL(img.imageUrl);
        }
      });
      setImages([]);
      setSelectedImages(new Set());
      localStorage.removeItem('chateau-analyzer-images');
      setShowConfirmDialog(false);
    });
    setShowConfirmDialog(true);
  };

  const exportResults = () => {
    const csvContent = [
      ['Filename', 'File Size (KB)', 'Upload Date', 'Castle Detected', 'Confidence %', 'Analysis Time (ms)', 'Status', 'Lighting', 'Position', 'AI Reasoning'].join(','),
      ...images.map(img => [
        img.fileName,
        Math.round(img.fileSize / 1024),
        new Date(img.uploadTime).toLocaleString(),
        img.isCastleDetected ? 'Yes' : 'No',
        img.confidence.toFixed(1),
        img.analysisTime,
        img.status,
        img.lightingCondition || 'unknown',
        img.castlePosition || 'unknown',
        `"${img.aiReasoning?.replace(/"/g, '""') || ''}"`
      ].join(','))
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `castle-analysis-results-${new Date().toISOString().split('T')[0]}.csv`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const toggleImageSelection = (imageId: string) => {
    setSelectedImages(prev => {
      const updated = new Set(prev);
      if (updated.has(imageId)) {
        updated.delete(imageId);
      } else {
        updated.add(imageId);
      }
      return updated;
    });
  };

  const selectAllImages = () => {
    const filteredImageIds = getFilteredAndSortedImages().map(img => img.id);
    setSelectedImages(new Set(filteredImageIds));
  };

  const deselectAllImages = () => {
    setSelectedImages(new Set());
  };

  const getFilteredAndSortedImages = (): ImageAnalysis[] => {
    let filtered = images;

    // Apply filter
    switch (filter) {
      case 'castle':
        filtered = filtered.filter(img => img.status === 'completed' && img.isCastleDetected);
        break;
      case 'no-castle':
        filtered = filtered.filter(img => img.status === 'completed' && !img.isCastleDetected);
        break;
      case 'high-confidence':
        filtered = filtered.filter(img => img.status === 'completed' && img.confidence >= CONFIDENCE_THRESHOLD);
        break;
      case 'pending':
        filtered = filtered.filter(img => img.status === 'pending' || img.status === 'analyzing');
        break;
      case 'error':
        filtered = filtered.filter(img => img.status === 'error');
        break;
    }

    // Apply sort
    filtered.sort((a, b) => {
      let comparison = 0;
      switch (sortBy) {
        case 'upload-time':
          comparison = a.uploadTime - b.uploadTime;
          break;
        case 'confidence':
          comparison = a.confidence - b.confidence;
          break;
        case 'filename':
          comparison = a.fileName.localeCompare(b.fileName);
          break;
      }
      return sortOrder === 'asc' ? comparison : -comparison;
    });

    return filtered;
  };

  const getAnalysisStats = (): AnalysisStats => {
    const completedImages = images.filter(img => img.status === 'completed');
    const castleDetected = completedImages.filter(img => img.isCastleDetected).length;
    const highConfidenceDetections = completedImages.filter(img => img.confidence >= CONFIDENCE_THRESHOLD).length;
    const daylightDetections = completedImages.filter(img => img.lightingCondition === 'daylight').length;
    const nighttimeDetections = completedImages.filter(img => img.lightingCondition === 'nighttime').length;
    const totalProcessingTime = completedImages.reduce((sum, img) => sum + img.analysisTime, 0);
    const averageConfidence = completedImages.length > 0 
      ? completedImages.reduce((sum, img) => sum + img.confidence, 0) / completedImages.length 
      : 0;

    return {
      total: images.length,
      castleDetected,
      notCastleDetected: completedImages.length - castleDetected,
      averageConfidence,
      processingTime: totalProcessingTime,
      highConfidenceDetections,
      daylightDetections,
      nighttimeDetections
    };
  };

  const formatFileSize = (bytes: number): string => {
    const kb = bytes / 1024;
    if (kb < 1024) return `${kb.toFixed(1)} KB`;
    const mb = kb / 1024;
    return `${mb.toFixed(1)} MB`;
  };

  const formatDuration = (ms: number): string => {
    if (ms < 1000) return `${ms}ms`;
    const seconds = ms / 1000;
    return `${seconds.toFixed(1)}s`;
  };

  const getConfidenceColor = (confidence: number): string => {
    if (confidence >= CONFIDENCE_THRESHOLD) return 'text-green-600 dark:text-green-400';
    if (confidence >= 70) return 'text-yellow-600 dark:text-yellow-400';
    return 'text-red-600 dark:text-red-400';
  };

  const getConfidenceBadgeColor = (confidence: number): string => {
    if (confidence >= CONFIDENCE_THRESHOLD) return 'badge-success';
    if (confidence >= 70) return 'badge-warning';
    return 'badge-error';
  };

  const getConfidenceLabel = (confidence: number): string => {
    if (confidence >= CONFIDENCE_THRESHOLD) return 'High Precision';
    if (confidence >= 70) return 'Medium';
    return 'Low';
  };

  const filteredImages = getFilteredAndSortedImages();
  const stats = getAnalysisStats();

  // Handle Escape key for modal
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && showConfirmDialog) {
        setShowConfirmDialog(false);
      }
    };
    document.addEventListener('keydown', handleEscape);
    return () => document.removeEventListener('keydown', handleEscape);
  }, [showConfirmDialog]);

  return (
    <div id="welcome_fallback" className="min-h-screen bg-gray-50 dark:bg-slate-900 theme-transition">
      <AILayer
        ref={aiLayerRef}
        prompt=""
        onResult={handleAIResult}
        onError={handleAIError}
        onLoading={handleAILoading}
      />

      {/* Header */}
      <header className="bg-white dark:bg-slate-800 shadow-sm border-b border-gray-200 dark:border-slate-700 theme-transition">
        <div className="container-fluid py-4">
          <div className="flex-between">
            <div className="flex items-center gap-3">
              <div className="bg-primary-500 p-2 rounded-lg">
                <Shield className="h-6 w-6 text-white" />
              </div>
              <div>
                <h1 className="text-xl font-bold text-gray-900 dark:text-white">Precision Castle Detector</h1>
                <p className="text-sm text-gray-500 dark:text-slate-400">High-precision AI castle identification • 90%+ confidence threshold</p>
              </div>
            </div>
            <div className="flex items-center gap-4">
              {currentUser && (
                <span className="text-sm text-gray-600 dark:text-slate-300">
                  Welcome, {currentUser.first_name}
                </span>
              )}
              <button
                onClick={logout}
                className="btn bg-gray-100 hover:bg-gray-200 text-gray-700 dark:bg-slate-700 dark:hover:bg-slate-600 dark:text-slate-200 theme-transition"
              >
                Logout
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Navigation */}
      <nav className="bg-white dark:bg-slate-800 border-b border-gray-200 dark:border-slate-700 theme-transition">
        <div className="container-fluid">
          <div className="flex space-x-8">
            {[
              { id: 'upload', label: 'Upload', icon: Upload },
              { id: 'results', label: 'Results', icon: Target },
              { id: 'analytics', label: 'Analytics', icon: BarChart3 },
              { id: 'settings', label: 'Settings', icon: Settings }
            ].map(({ id, label, icon: Icon }) => (
              <button
                key={id}
                id={`${id}-tab`}
                onClick={() => setActiveTab(id as any)}
                className={`flex items-center gap-2 px-4 py-3 border-b-2 font-medium transition-colors ${
                  activeTab === id
                    ? 'border-primary-500 text-primary-600 dark:text-primary-400'
                    : 'border-transparent text-gray-500 hover:text-gray-700 dark:text-slate-400 dark:hover:text-slate-200'
                }`}
              >
                <Icon className="h-4 w-4" />
                {label}
              </button>
            ))}
          </div>
        </div>
      </nav>

      {/* Main Content */}
      <main className="container-fluid py-6">
        {activeTab === 'upload' && (
          <div id="generation_issue_fallback" className="space-y-6">
            <div className="text-center">
              <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">Upload Images for Precision Castle Detection</h2>
              <p className="text-gray-600 dark:text-slate-400 mb-4">
                Advanced AI analysis with 90%+ confidence threshold for accurate castle identification
              </p>
              <div className="flex flex-wrap justify-center gap-2 text-sm">
                <span className="badge bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200">Daylight & Nighttime Detection</span>
                <span className="badge bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200">Background Castle Recognition</span>
                <span className="badge bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200">90%+ Confidence Threshold</span>
              </div>
            </div>

            {/* Upload Area */}
            <div
              id="upload-area"
              className="card-responsive border-2 border-dashed border-gray-300 dark:border-slate-600 hover:border-primary-500 dark:hover:border-primary-400 transition-colors cursor-pointer"
              onDrop={handleDrop}
              onDragOver={handleDragOver}
              onClick={() => fileInputRef.current?.click()}
            >
              <div className="text-center py-12">
                <Upload className="mx-auto h-12 w-12 text-gray-400 dark:text-slate-500 mb-4" />
                <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
                  Drop images here or click to browse
                </h3>
                <p className="text-gray-500 dark:text-slate-400 mb-4">
                  Supports JPG, PNG, and other image formats • Multiple files supported
                </p>
                <div className="bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800 rounded-lg p-4 text-left max-w-2xl mx-auto">
                  <div className="flex items-start gap-2">
                    <Target className="h-5 w-5 text-amber-600 dark:text-amber-400 mt-0.5 flex-shrink-0" />
                    <div>
                      <h4 className="font-medium text-amber-800 dark:text-amber-200">Enhanced Detection Features</h4>
                      <ul className="text-sm text-amber-700 dark:text-amber-300 mt-1 space-y-1">
                        <li>• Detects castles in foreground, background, or distant views</li>
                        <li>• Works with both daylight and nighttime photographs</li>
                        <li>• Identifies architectural features like towers, battlements, and stone construction</li>
                        <li>• Only flags as "Castle Detected" with 90%+ confidence for maximum precision</li>
                      </ul>
                    </div>
                  </div>
                </div>
              </div>
              <input
                ref={fileInputRef}
                type="file"
                multiple
                accept="image/*"
                onChange={(e) => handleFileUpload(e.target.files)}
                className="hidden"
              />
            </div>

            {/* Recent Uploads */}
            {images.length > 0 && (
              <div id="recent-uploads">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                  Recent Uploads ({images.length})
                </h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                  {images.slice(-8).map((image) => (
                    <div key={image.id} className="card-sm">
                      <div className="relative mb-3">
                        <img
                          src={image.imageUrl}
                          alt={image.fileName}
                          className="w-full h-32 object-cover rounded-md"
                        />
                        {image.status === 'analyzing' && (
                          <div className="absolute inset-0 bg-black bg-opacity-50 flex items-center justify-center rounded-md">
                            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-white"></div>
                          </div>
                        )}
                        {image.status === 'completed' && (
                          <div className="absolute top-2 right-2">
                            {image.isCastleDetected ? (
                              <div className="bg-green-500 rounded-full p-1">
                                <Shield className="h-4 w-4 text-white" />
                              </div>
                            ) : (
                              <div className="bg-red-500 rounded-full p-1">
                                <XCircle className="h-4 w-4 text-white" />
                              </div>
                            )}
                          </div>
                        )}
                        {image.confidence >= CONFIDENCE_THRESHOLD && image.status === 'completed' && (
                          <div className="absolute top-2 left-2">
                            <div className="bg-green-500 rounded-full p-1">
                              <Target className="h-3 w-3 text-white" />
                            </div>
                          </div>
                        )}
                      </div>
                      <div className="space-y-2">
                        <h4 className="font-medium text-sm text-gray-900 dark:text-white truncate">
                          {image.fileName}
                        </h4>
                        <div className="flex items-center justify-between text-xs">
                          <span className="text-gray-500 dark:text-slate-400">
                            {formatFileSize(image.fileSize)}
                          </span>
                          {image.status === 'completed' && (
                            <div className="flex items-center gap-1">
                              <span className={`font-medium ${getConfidenceColor(image.confidence)}`}>
                                {image.confidence.toFixed(0)}%
                              </span>
                              {image.confidence >= CONFIDENCE_THRESHOLD && (
                                <Target className="h-3 w-3 text-green-500" />
                              )}
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}

        {activeTab === 'results' && (
          <div className="space-y-6">
            <div className="flex-between">
              <div>
                <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Precision Analysis Results</h2>
                <p className="text-gray-600 dark:text-slate-400">
                  {filteredImages.length} of {images.length} images shown • {stats.highConfidenceDetections} high-precision detections
                </p>
              </div>
              <div className="flex items-center gap-2">
                {selectedImages.size > 0 && (
                  <button
                    onClick={deleteSelectedImages}
                    className="btn bg-red-100 hover:bg-red-200 text-red-700 dark:bg-red-900 dark:hover:bg-red-800 dark:text-red-200"
                  >
                    <Trash2 className="h-4 w-4 mr-2" />
                    Delete ({selectedImages.size})
                  </button>
                )}
                <button
                  onClick={exportResults}
                  disabled={images.length === 0}
                  className="btn btn-primary"
                >
                  <Download className="h-4 w-4 mr-2" />
                  Export CSV
                </button>
              </div>
            </div>

            {/* Filters and Controls */}
            <div className="card-responsive">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <label className="form-label">Filter by Result</label>
                  <select
                    value={filter}
                    onChange={(e) => setFilter(e.target.value as FilterType)}
                    className="input"
                  >
                    <option value="all">All Images</option>
                    <option value="castle">Castle Detected</option>
                    <option value="no-castle">No Castle</option>
                    <option value="high-confidence">High Confidence (90%+)</option>
                    <option value="pending">Pending Analysis</option>
                    <option value="error">Errors</option>
                  </select>
                </div>
                <div>
                  <label className="form-label">Sort by</label>
                  <select
                    value={sortBy}
                    onChange={(e) => setSortBy(e.target.value as SortType)}
                    className="input"
                  >
                    <option value="upload-time">Upload Time</option>
                    <option value="confidence">Confidence</option>
                    <option value="filename">Filename</option>
                  </select>
                </div>
                <div>
                  <label className="form-label">Order</label>
                  <select
                    value={sortOrder}
                    onChange={(e) => setSortOrder(e.target.value as 'asc' | 'desc')}
                    className="input"
                  >
                    <option value="desc">Descending</option>
                    <option value="asc">Ascending</option>
                  </select>
                </div>
              </div>
              <div className="flex gap-2 mt-4">
                <button
                  onClick={selectAllImages}
                  className="btn bg-gray-100 hover:bg-gray-200 text-gray-700 dark:bg-slate-700 dark:hover:bg-slate-600 dark:text-slate-200"
                >
                  Select All
                </button>
                <button
                  onClick={deselectAllImages}
                  className="btn bg-gray-100 hover:bg-gray-200 text-gray-700 dark:bg-slate-700 dark:hover:bg-slate-600 dark:text-slate-200"
                >
                  Deselect All
                </button>
              </div>
            </div>

            {/* Results Grid */}
            {filteredImages.length === 0 ? (
              <div className="text-center py-12">
                <Shield className="mx-auto h-12 w-12 text-gray-400 dark:text-slate-500 mb-4" />
                <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
                  No images found
                </h3>
                <p className="text-gray-500 dark:text-slate-400">
                  Upload some images to get started with high-precision castle analysis.
                </p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {filteredImages.map((image) => (
                  <div
                    key={image.id}
                    className={`card-sm cursor-pointer transition-all ${
                      selectedImages.has(image.id) ? 'ring-2 ring-primary-500' : ''
                    }`}
                    onClick={() => toggleImageSelection(image.id)}
                  >
                    <div className="relative mb-4">
                      <img
                        src={image.imageUrl}
                        alt={image.fileName}
                        className="w-full h-48 object-cover rounded-lg"
                      />
                      {image.status === 'analyzing' && (
                        <div className="absolute inset-0 bg-black bg-opacity-50 flex items-center justify-center rounded-lg">
                          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-white"></div>
                        </div>
                      )}
                      {image.status === 'completed' && (
                        <div className="absolute top-3 right-3 flex gap-2">
                          {image.confidence >= CONFIDENCE_THRESHOLD && (
                            <div className="bg-green-500 rounded-full p-1">
                              <Target className="h-4 w-4 text-white" />
                            </div>
                          )}
                          {image.isCastleDetected ? (
                            <div className="bg-green-500 rounded-full p-1">
                              <Shield className="h-4 w-4 text-white" />
                            </div>
                          ) : (
                            <div className="bg-red-500 rounded-full p-1">
                              <XCircle className="h-4 w-4 text-white" />
                            </div>
                          )}
                        </div>
                      )}
                      {image.status === 'error' && (
                        <div className="absolute top-3 right-3">
                          <div className="bg-yellow-500 rounded-full p-1">
                            <AlertCircle className="h-4 w-4 text-white" />
                          </div>
                        </div>
                      )}
                      <div className="absolute top-3 left-3">
                        <input
                          type="checkbox"
                          checked={selectedImages.has(image.id)}
                          onChange={() => toggleImageSelection(image.id)}
                          className="h-4 w-4 text-primary-600 rounded focus:ring-primary-500"
                          onClick={(e) => e.stopPropagation()}
                        />
                      </div>
                    </div>
                    
                    <div className="space-y-3">
                      <div>
                        <h3 className="font-medium text-gray-900 dark:text-white truncate">
                          {image.fileName}
                        </h3>
                        <p className="text-sm text-gray-500 dark:text-slate-400">
                          {formatFileSize(image.fileSize)} • {new Date(image.uploadTime).toLocaleDateString()}
                        </p>
                      </div>

                      {image.status === 'completed' && (
                        <div className="space-y-2">
                          <div className="flex items-center justify-between">
                            <span className="text-sm font-medium text-gray-700 dark:text-slate-300">
                              {image.isCastleDetected ? 'Castle Detected' : 'No Castle'}
                            </span>
                            <div className="flex items-center gap-1">
                              <span className={`badge ${getConfidenceBadgeColor(image.confidence)}`}>
                                {image.confidence.toFixed(0)}%
                              </span>
                              {image.confidence >= CONFIDENCE_THRESHOLD && (
                                <span className="badge badge-success text-xs">
                                  High Precision
                                </span>
                              )}
                            </div>
                          </div>
                          <div className="w-full bg-gray-200 dark:bg-slate-700 rounded-full h-2">
                            <div
                              className={`h-2 rounded-full ${
                                image.confidence >= CONFIDENCE_THRESHOLD ? 'bg-green-500' :
                                image.confidence >= 70 ? 'bg-yellow-500' : 'bg-red-500'
                              }`}
                              style={{ width: `${image.confidence}%` }}
                            ></div>
                          </div>
                          <div className="grid grid-cols-2 gap-2 text-xs">
                            <div>
                              <span className="text-gray-500 dark:text-slate-400">Lighting:</span>
                              <div className="font-medium text-gray-700 dark:text-slate-300 capitalize">
                                {image.lightingCondition || 'Unknown'}
                              </div>
                            </div>
                            <div>
                              <span className="text-gray-500 dark:text-slate-400">Position:</span>
                              <div className="font-medium text-gray-700 dark:text-slate-300 capitalize">
                                {image.castlePosition || 'Unknown'}
                              </div>
                            </div>
                          </div>
                          {image.aiReasoning && (
                            <div className="bg-gray-50 dark:bg-slate-700 rounded p-2">
                              <p className="text-xs text-gray-600 dark:text-slate-400">
                                <strong>AI Analysis:</strong> {image.aiReasoning}
                              </p>
                            </div>
                          )}
                          <p className="text-xs text-gray-500 dark:text-slate-400">
                            Analysis: {formatDuration(image.analysisTime)}
                          </p>
                        </div>
                      )}

                      {image.status === 'pending' && (
                        <div className="text-center py-2">
                          <span className="badge badge-info">Pending Analysis</span>
                        </div>
                      )}

                      {image.status === 'analyzing' && (
                        <div className="text-center py-2">
                          <span className="badge badge-warning">Analyzing...</span>
                        </div>
                      )}

                      {image.status === 'error' && (
                        <div className="text-center py-2">
                          <span className="badge badge-error">Analysis Failed</span>
                          {image.errorMessage && (
                            <p className="text-xs text-red-600 dark:text-red-400 mt-1">
                              {image.errorMessage}
                            </p>
                          )}
                        </div>
                      )}

                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          deleteImage(image.id);
                        }}
                        className="w-full btn bg-red-50 hover:bg-red-100 text-red-700 dark:bg-red-900/20 dark:hover:bg-red-900/40 dark:text-red-400"
                      >
                        <Trash2 className="h-4 w-4 mr-2" />
                        Delete
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {activeTab === 'analytics' && (
          <div id="analytics-tab" className="space-y-6">
            <div>
              <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">Precision Analytics Dashboard</h2>
              <p className="text-gray-600 dark:text-slate-400">
                Advanced metrics for high-precision castle detection analysis
              </p>
            </div>

            {/* Stats Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              <div className="stat-card">
                <div className="stat-title">Total Images</div>
                <div className="stat-value">{stats.total}</div>
                <div className="stat-desc">Images uploaded</div>
              </div>
              <div className="stat-card">
                <div className="stat-title">High Precision Detections</div>
                <div className="stat-value text-green-600 dark:text-green-400">{stats.highConfidenceDetections}</div>
                <div className="stat-desc">90%+ confidence threshold</div>
              </div>
              <div className="stat-card">
                <div className="stat-title">Average Confidence</div>
                <div className="stat-value">{stats.averageConfidence.toFixed(1)}%</div>
                <div className="stat-desc">Across all analyses</div>
              </div>
              <div className="stat-card">
                <div className="stat-title">Processing Time</div>
                <div className="stat-value">{formatDuration(stats.processingTime)}</div>
                <div className="stat-desc">Total analysis time</div>
              </div>
            </div>

            {/* Enhanced Charts */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <div className="card-responsive">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Detection Results</h3>
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <span className="text-gray-700 dark:text-slate-300">High Precision Detections (90%+)</span>
                    <div className="flex items-center gap-2">
                      <div className="w-32 bg-gray-200 dark:bg-slate-700 rounded-full h-3">
                        <div 
                          className="bg-green-500 h-3 rounded-full"
                          style={{ width: `${stats.total > 0 ? (stats.highConfidenceDetections / stats.total) * 100 : 0}%` }}
                        ></div>
                      </div>
                      <span className="text-sm font-medium text-gray-900 dark:text-white w-12">
                        {stats.highConfidenceDetections}
                      </span>
                    </div>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-gray-700 dark:text-slate-300">Total Castle Detected</span>
                    <div className="flex items-center gap-2">
                      <div className="w-32 bg-gray-200 dark:bg-slate-700 rounded-full h-3">
                        <div 
                          className="bg-blue-500 h-3 rounded-full"
                          style={{ width: `${stats.total > 0 ? (stats.castleDetected / stats.total) * 100 : 0}%` }}
                        ></div>
                      </div>
                      <span className="text-sm font-medium text-gray-900 dark:text-white w-12">
                        {stats.castleDetected}
                      </span>
                    </div>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-gray-700 dark:text-slate-300">No Castle</span>
                    <div className="flex items-center gap-2">
                      <div className="w-32 bg-gray-200 dark:bg-slate-700 rounded-full h-3">
                        <div 
                          className="bg-red-500 h-3 rounded-full"
                          style={{ width: `${stats.total > 0 ? (stats.notCastleDetected / stats.total) * 100 : 0}%` }}
                        ></div>
                      </div>
                      <span className="text-sm font-medium text-gray-900 dark:text-white w-12">
                        {stats.notCastleDetected}
                      </span>
                    </div>
                  </div>
                </div>
              </div>

              <div className="card-responsive">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Lighting Conditions</h3>
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <span className="text-gray-700 dark:text-slate-300">Daylight Detection</span>
                    <div className="flex items-center gap-2">
                      <div className="w-32 bg-gray-200 dark:bg-slate-700 rounded-full h-3">
                        <div 
                          className="bg-yellow-500 h-3 rounded-full"
                          style={{ width: `${stats.total > 0 ? (stats.daylightDetections / stats.total) * 100 : 0}%` }}
                        ></div>
                      </div>
                      <span className="text-sm font-medium text-gray-900 dark:text-white w-12">
                        {stats.daylightDetections}
                      </span>
                    </div>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-gray-700 dark:text-slate-300">Nighttime Detection</span>
                    <div className="flex items-center gap-2">
                      <div className="w-32 bg-gray-200 dark:bg-slate-700 rounded-full h-3">
                        <div 
                          className="bg-indigo-500 h-3 rounded-full"
                          style={{ width: `${stats.total > 0 ? (stats.nighttimeDetections / stats.total) * 100 : 0}%` }}
                        ></div>
                      </div>
                      <span className="text-sm font-medium text-gray-900 dark:text-white w-12">
                        {stats.nighttimeDetections}
                      </span>
                    </div>
                  </div>
                  
                  <div className="mt-6 p-3 bg-green-50 dark:bg-green-900/20 rounded-lg">
                    <div className="flex items-center gap-2">
                      <Target className="h-4 w-4 text-green-600 dark:text-green-400" />
                      <span className="text-sm font-medium text-green-800 dark:text-green-200">
                        Precision Rate: {stats.total > 0 ? ((stats.highConfidenceDetections / stats.total) * 100).toFixed(1) : 0}%
                      </span>
                    </div>
                    <p className="text-xs text-green-700 dark:text-green-300 mt-1">
                      Percentage of detections meeting 90%+ confidence threshold
                    </p>
                  </div>
                </div>
              </div>

              <div className="card-responsive lg:col-span-2">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Confidence Distribution</h3>
                <div className="space-y-3">
                  {[
                    { label: 'High Precision (90-100%)', count: images.filter(img => img.confidence >= 90).length, color: 'bg-green-500' },
                    { label: 'Medium Confidence (70-89%)', count: images.filter(img => img.confidence >= 70 && img.confidence < 90).length, color: 'bg-yellow-500' },
                    { label: 'Low Confidence (50-69%)', count: images.filter(img => img.confidence >= 50 && img.confidence < 70).length, color: 'bg-orange-500' },
                    { label: 'Very Low (<50%)', count: images.filter(img => img.confidence < 50 && img.status === 'completed').length, color: 'bg-red-500' }
                  ].map(({ label, count, color }) => (
                    <div key={label} className="flex items-center justify-between">
                      <span className="text-gray-700 dark:text-slate-300">{label}</span>
                      <div className="flex items-center gap-2">
                        <div className="w-40 bg-gray-200 dark:bg-slate-700 rounded-full h-3">
                          <div 
                            className={`${color} h-3 rounded-full`}
                            style={{ width: `${stats.total > 0 ? (count / stats.total) * 100 : 0}%` }}
                          ></div>
                        </div>
                        <span className="text-sm font-medium text-gray-900 dark:text-white w-8">
                          {count}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'settings' && (
          <div id="settings-tab" className="space-y-6">
            <div>
              <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">Settings</h2>
              <p className="text-gray-600 dark:text-slate-400">
                Manage your application preferences and data
              </p>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Precision Settings */}
              <div className="card-responsive">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
                  <Target className="h-5 w-5" />
                  Precision Configuration
                </h3>
                <div className="space-y-4">
                  <div className="p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
                    <h4 className="font-medium text-blue-900 dark:text-blue-200">Current Threshold</h4>
                    <p className="text-2xl font-bold text-blue-600 dark:text-blue-400 mt-1">{CONFIDENCE_THRESHOLD}%</p>
                    <p className="text-sm text-blue-700 dark:text-blue-300 mt-1">
                      Minimum confidence level for castle detection
                    </p>
                  </div>
                  <div className="space-y-2">
                    <h4 className="font-medium text-gray-900 dark:text-white">Detection Features</h4>
                    <ul className="text-sm text-gray-600 dark:text-slate-400 space-y-1">
                      <li>✓ Enhanced architectural feature recognition</li>
                      <li>✓ Day and night lighting adaptation</li>
                      <li>✓ Background castle detection</li>
                      <li>✓ Position and context analysis</li>
                      <li>✓ Detailed reasoning for each analysis</li>
                    </ul>
                  </div>
                </div>
              </div>

              {/* Data Management */}
              <div className="card-responsive">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Data Management</h3>
                <div className="space-y-4">
                  <div>
                    <h4 className="font-medium text-gray-900 dark:text-white mb-2">Export Enhanced Results</h4>
                    <p className="text-sm text-gray-600 dark:text-slate-400 mb-3">
                      Download comprehensive analysis results including AI reasoning and metadata
                    </p>
                    <button
                      onClick={exportResults}
                      disabled={images.length === 0}
                      className="btn btn-primary"
                    >
                      <FileDown className="h-4 w-4 mr-2" />
                      Export Enhanced CSV
                    </button>
                  </div>
                  
                  <hr className="border-gray-200 dark:border-slate-700" />
                  
                  <div>
                    <h4 className="font-medium text-gray-900 dark:text-white mb-2">Clear All Data</h4>
                    <p className="text-sm text-gray-600 dark:text-slate-400 mb-3">
                      Permanently delete all uploaded images and analysis results
                    </p>
                    <button
                      onClick={clearAllData}
                      disabled={images.length === 0}
                      className="btn bg-red-100 hover:bg-red-200 text-red-700 dark:bg-red-900 dark:hover:bg-red-800 dark:text-red-200"
                    >
                      <Trash2 className="h-4 w-4 mr-2" />
                      Clear All Data
                    </button>
                  </div>
                </div>
              </div>

              {/* Application Information */}
              <div className="card-responsive lg:col-span-2">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Application Information</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-4">
                    <div className="grid grid-cols-2 gap-4 text-sm">
                      <div>
                        <span className="font-medium text-gray-700 dark:text-slate-300">Version:</span>
                        <div className="text-gray-600 dark:text-slate-400">2.0.0 (Precision)</div>
                      </div>
                      <div>
                        <span className="font-medium text-gray-700 dark:text-slate-300">Build Date:</span>
                        <div className="text-gray-600 dark:text-slate-400">2025-06-06</div>
                      </div>
                      <div>
                        <span className="font-medium text-gray-700 dark:text-slate-300">Total Images:</span>
                        <div className="text-gray-600 dark:text-slate-400">{images.length}</div>
                      </div>
                      <div>
                        <span className="font-medium text-gray-700 dark:text-slate-300">High Precision:</span>
                        <div className="text-gray-600 dark:text-slate-400">{stats.highConfidenceDetections}</div>
                      </div>
                      <div>
                        <span className="font-medium text-gray-700 dark:text-slate-300">Storage Used:</span>
                        <div className="text-gray-600 dark:text-slate-400">
                          {formatFileSize(images.reduce((sum, img) => sum + img.fileSize, 0))}
                        </div>
                      </div>
                      <div>
                        <span className="font-medium text-gray-700 dark:text-slate-300">Avg Analysis:</span>
                        <div className="text-gray-600 dark:text-slate-400">
                          {images.length > 0 ? formatDuration(stats.processingTime / images.filter(img => img.status === 'completed').length) : '0ms'}
                        </div>
                      </div>
                    </div>
                  </div>
                  
                  <div className="space-y-4">
                    <div className="p-4 bg-amber-50 dark:bg-amber-900/20 rounded-lg">
                      <div className="flex items-start gap-2">
                        <AlertCircle className="h-5 w-5 text-amber-600 dark:text-amber-400 mt-0.5 flex-shrink-0" />
                        <div>
                          <h4 className="font-medium text-amber-900 dark:text-amber-200">Enhanced AI Analysis</h4>
                          <p className="text-sm text-amber-700 dark:text-amber-300 mt-1">
                            This precision system uses advanced AI prompting for 90%+ confidence castle detection. 
                            Results include detailed architectural analysis and lighting condition assessment.
                          </p>
                        </div>
                      </div>
                    </div>
                    
                    <div className="p-4 bg-green-50 dark:bg-green-900/20 rounded-lg">
                      <div className="flex items-start gap-2">
                        <Shield className="h-5 w-5 text-green-600 dark:text-green-400 mt-0.5 flex-shrink-0" />
                        <div>
                          <h4 className="font-medium text-green-900 dark:text-green-200">Accuracy Notice</h4>
                          <p className="text-sm text-green-700 dark:text-green-300 mt-1">
                            The enhanced system focuses on precision over recall. Only images with 90%+ confidence 
                            are flagged as containing castles to minimize false positives.
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </main>

      {/* Confirmation Dialog */}
      {showConfirmDialog && (
        <div className="modal-backdrop" onClick={() => setShowConfirmDialog(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h3 className="text-lg font-medium text-gray-900 dark:text-white">Confirm Action</h3>
              <button 
                onClick={() => setShowConfirmDialog(false)}
                className="text-gray-400 hover:text-gray-500 dark:hover:text-gray-300"
              >
                <X className="h-5 w-5" />
              </button>
            </div>
            <div className="mt-2">
              <p className="text-gray-500 dark:text-slate-400">{confirmMessage}</p>
            </div>
            <div className="modal-footer">
              <button 
                onClick={() => setShowConfirmDialog(false)}
                className="btn bg-gray-100 text-gray-700 hover:bg-gray-200 dark:bg-slate-700 dark:text-slate-200 dark:hover:bg-slate-600"
              >
                Cancel
              </button>
              <button 
                onClick={() => {
                  confirmAction?.();
                  setShowConfirmDialog(false);
                }}
                className="btn bg-red-100 hover:bg-red-200 text-red-700 dark:bg-red-900 dark:hover:bg-red-800 dark:text-red-200"
              >
                Confirm
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Footer */}
      <footer className="mt-12 border-t border-gray-200 dark:border-slate-700 py-6 theme-transition">
        <div className="container-fluid text-center text-sm text-gray-500 dark:text-slate-400">
          Copyright © 2025 Datavtar Private Limited. All rights reserved.
        </div>
      </footer>
    </div>
  );
};

export default App;