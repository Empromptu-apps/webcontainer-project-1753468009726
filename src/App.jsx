import React, { useState } from 'react';

const StoryGeneratorApp = () => {
  const [initialStory, setInitialStory] = useState('');
  const [specializedWords, setSpecializedWords] = useState('');
  const [generatedStory, setGeneratedStory] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);
  const [darkMode, setDarkMode] = useState(false);
  const [apiLogs, setApiLogs] = useState([]);
  const [showApiLogs, setShowApiLogs] = useState(false);
  const [createdObjects, setCreatedObjects] = useState([]);

  const logApiCall = (method, url, data, response) => {
    const log = {
      timestamp: new Date().toISOString(),
      method,
      url,
      request: data,
      response: response
    };
    setApiLogs(prev => [...prev, log]);
  };

  const deleteObjects = async () => {
    for (const objectName of createdObjects) {
      try {
        const response = await fetch(`https://builder.empromptu.ai/api_tools/objects/${objectName}`, {
          method: 'DELETE',
          headers: {
            'Authorization': 'Bearer 5a8b550223358e69c39eebdadc8b12ca',
            'X-Generated-App-ID': '178270e3-5da6-47de-966c-388398459544',
            'X-Usage-Key': '9afc6a8f6d6c935df2c51fa8991377ce'
          }
        });
        console.log(`Deleted object: ${objectName}`);
      } catch (error) {
        console.error(`Failed to delete object ${objectName}:`, error);
      }
    }
    setCreatedObjects([]);
    alert('All created objects have been deleted.');
  };

  const generateStory = async () => {
    if (!initialStory.trim()) {
      alert('Please provide an initial story or text.');
      return;
    }

    setIsGenerating(true);
    setGeneratedStory('');
    setApiLogs([]);

    try {
      // Step 1: Input the initial story
      const inputData = {
        created_object_name: 'initial_story',
        data_type: 'strings',
        input_data: [initialStory]
      };

      const inputResponse = await fetch('https://builder.empromptu.ai/api_tools/input_data', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': 'Bearer 5a8b550223358e69c39eebdadc8b12ca',
          'X-Generated-App-ID': '178270e3-5da6-47de-966c-388398459544',
          'X-Usage-Key': '9afc6a8f6d6c935df2c51fa8991377ce'
        },
        body: JSON.stringify(inputData)
      });

      const inputResult = await inputResponse.json();
      logApiCall('POST', '/input_data', inputData, inputResult);

      if (!inputResponse.ok) throw new Error('Failed to input story');

      setCreatedObjects(prev => [...prev, 'initial_story']);

      // Step 2: Generate new story using the initial story and specialized words
      const wordsInstruction = specializedWords.trim() 
        ? `Make sure to incorporate these specific words naturally into the story: ${specializedWords}` 
        : '';

      const promptData = {
        created_object_names: ['generated_story'],
        prompt_string: `Based on this initial story: {initial_story}

Create a new, engaging story suitable for elementary school students (grades 1-6). The story should:
- Be age-appropriate and educational
- Use simple, clear language that young students can understand
- Be engaging and fun to read
- Maintain the spirit and themes of the original story while creating something new
- Be approximately 200-400 words long

${wordsInstruction}

Write the story in a way that flows naturally and would be perfect for teachers to use in their classrooms.`,
        inputs: [
          {
            input_object_name: 'initial_story',
            mode: 'combine_events'
          }
        ]
      };

      const promptResponse = await fetch('https://builder.empromptu.ai/api_tools/apply_prompt', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': 'Bearer 5a8b550223358e69c39eebdadc8b12ca',
          'X-Generated-App-ID': '178270e3-5da6-47de-966c-388398459544',
          'X-Usage-Key': '9afc6a8f6d6c935df2c51fa8991377ce'
        },
        body: JSON.stringify(promptData)
      });

      const promptResult = await promptResponse.json();
      logApiCall('POST', '/apply_prompt', promptData, promptResult);

      if (!promptResponse.ok) throw new Error('Failed to generate story');

      setCreatedObjects(prev => [...prev, 'generated_story']);

      // Step 3: Retrieve the generated story
      const retrieveData = {
        object_name: 'generated_story',
        return_type: 'pretty_text'
      };

      const retrieveResponse = await fetch('https://builder.empromptu.ai/api_tools/return_data', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': 'Bearer 5a8b550223358e69c39eebdadc8b12ca',
          'X-Generated-App-ID': '178270e3-5da6-47de-966c-388398459544',
          'X-Usage-Key': '9afc6a8f6d6c935df2c51fa8991377ce'
        },
        body: JSON.stringify(retrieveData)
      });

      const result = await retrieveResponse.json();
      logApiCall('POST', '/return_data', retrieveData, result);

      if (!retrieveResponse.ok) throw new Error('Failed to retrieve story');

      setGeneratedStory(result.value || 'No story generated');

    } catch (error) {
      console.error('Error generating story:', error);
      alert('Error generating story. Please try again.');
    } finally {
      setIsGenerating(false);
    }
  };

  const copyToClipboard = () => {
    navigator.clipboard.writeText(generatedStory);
    alert('Story copied to clipboard!');
  };

  return (
    <div className={darkMode ? 'dark' : ''}>
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 transition-colors duration-200">
        {/* Header */}
        <div className="bg-white dark:bg-gray-800 shadow-sm border-b border-gray-200 dark:border-gray-700">
          <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
            <div className="flex justify-between items-center">
              <div>
                <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
                  AI Story Generator for Teachers
                </h1>
                <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                  Create engaging stories for grades 1-6 using your content and vocabulary words
                </p>
              </div>
              <button
                onClick={() => setDarkMode(!darkMode)}
                className="p-2 rounded-lg bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors"
                aria-label="Toggle dark mode"
              >
                {darkMode ? '☀️' : '🌙'}
              </button>
            </div>
          </div>
        </div>

        {/* Main Content */}
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            
            {/* Step 1: Input Column */}
            <div className="lg:col-span-1">
              <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg p-6 h-fit">
                <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4 flex items-center">
                  <span className="bg-primary-500 text-white rounded-full w-6 h-6 flex items-center justify-center text-sm mr-3">1</span>
                  Initial Story
                </h2>
                <textarea
                  value={initialStory}
                  onChange={(e) => setInitialStory(e.target.value)}
                  placeholder="Paste your initial story, lesson content, or any text that will serve as inspiration for the new story..."
                  className="w-full h-40 p-4 border-2 border-gray-200 dark:border-gray-600 rounded-xl resize-none focus:border-primary-500 focus:ring-2 focus:ring-primary-200 dark:focus:ring-primary-800 bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 transition-colors"
                  aria-label="Initial story input"
                />
                
                <h3 className="text-md font-medium text-gray-900 dark:text-white mt-6 mb-3">
                  Specialized Words (Optional)
                </h3>
                <textarea
                  value={specializedWords}
                  onChange={(e) => setSpecializedWords(e.target.value)}
                  placeholder="Enter vocabulary words separated by commas (e.g., adventure, courage, friendship, discovery, teamwork)"
                  className="w-full h-24 p-4 border-2 border-gray-200 dark:border-gray-600 rounded-xl resize-none focus:border-primary-500 focus:ring-2 focus:ring-primary-200 dark:focus:ring-primary-800 bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 transition-colors"
                  aria-label="Specialized words input"
                />
                <p className="text-xs text-gray-500 dark:text-gray-400 mt-2">
                  These words will be naturally incorporated into the generated story
                </p>
              </div>
            </div>

            {/* Step 2: Processing Column */}
            <div className="lg:col-span-1">
              <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg p-6 h-fit">
                <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4 flex items-center">
                  <span className="bg-primary-500 text-white rounded-full w-6 h-6 flex items-center justify-center text-sm mr-3">2</span>
                  Generate Story
                </h2>
                
                {isGenerating ? (
                  <div className="text-center py-8">
                    <div className="spinner mx-auto mb-4"></div>
                    <p className="text-gray-600 dark:text-gray-400 mb-4">Generating your story...</p>
                    <p className="text-sm text-gray-500 dark:text-gray-500">This may take a few moments</p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    <button
                      onClick={generateStory}
                      disabled={!initialStory.trim()}
                      className="w-full bg-green-600 hover:bg-green-700 disabled:bg-gray-400 disabled:cursor-not-allowed text-white font-semibold py-4 px-6 rounded-xl transition-colors focus:ring-2 focus:ring-green-500 focus:ring-offset-2 dark:focus:ring-offset-gray-800"
                      aria-label="Generate new story"
                    >
                      Generate New Story
                    </button>
                    
                    <div className="flex space-x-2">
                      <button
                        onClick={() => setShowApiLogs(!showApiLogs)}
                        className="flex-1 bg-green-600 hover:bg-green-700 text-white font-medium py-2 px-4 rounded-lg transition-colors text-sm"
                      >
                        {showApiLogs ? 'Hide' : 'Show'} API Logs
                      </button>
                      
                      <button
                        onClick={deleteObjects}
                        disabled={createdObjects.length === 0}
                        className="flex-1 bg-red-600 hover:bg-red-700 disabled:bg-gray-400 disabled:cursor-not-allowed text-white font-medium py-2 px-4 rounded-lg transition-colors text-sm"
                      >
                        Delete Objects
                      </button>
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Step 3: Output Column */}
            <div className="lg:col-span-1">
              <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg p-6">
                <div className="flex justify-between items-center mb-4">
                  <h2 className="text-lg font-semibold text-gray-900 dark:text-white flex items-center">
                    <span className="bg-primary-500 text-white rounded-full w-6 h-6 flex items-center justify-center text-sm mr-3">3</span>
                    Generated Story
                  </h2>
                  {generatedStory && (
                    <button
                      onClick={copyToClipboard}
                      className="bg-primary-600 hover:bg-primary-700 text-white font-medium py-2 px-4 rounded-lg transition-colors text-sm focus:ring-2 focus:ring-primary-500 focus:ring-offset-2 dark:focus:ring-offset-gray-800"
                      aria-label="Copy story to clipboard"
                    >
                      Copy Story
                    </button>
                  )}
                </div>
                
                {generatedStory ? (
                  <div className="bg-gray-50 dark:bg-gray-700 rounded-xl p-6 max-h-96 overflow-y-auto">
                    <div className="prose prose-sm dark:prose-invert max-w-none">
                      <div className="whitespace-pre-wrap text-gray-800 dark:text-gray-200 leading-relaxed">
                        {generatedStory}
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="bg-gray-50 dark:bg-gray-700 rounded-xl p-6 text-center">
                    <p className="text-gray-500 dark:text-gray-400">
                      Your generated story will appear here
                    </p>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* API Logs Section */}
          {showApiLogs && (
            <div className="mt-8 bg-white dark:bg-gray-800 rounded-2xl shadow-lg p-6">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">API Call Logs</h3>
              <div className="space-y-4 max-h-96 overflow-y-auto">
                {apiLogs.map((log, index) => (
                  <div key={index} className="bg-gray-50 dark:bg-gray-700 rounded-lg p-4">
                    <div className="flex justify-between items-start mb-2">
                      <span className="font-mono text-sm font-semibold text-primary-600 dark:text-primary-400">
                        {log.method} {log.url}
                      </span>
                      <span className="text-xs text-gray-500 dark:text-gray-400">
                        {new Date(log.timestamp).toLocaleTimeString()}
                      </span>
                    </div>
                    <details className="mt-2">
                      <summary className="cursor-pointer text-sm text-gray-600 dark:text-gray-300 hover:text-gray-800 dark:hover:text-gray-100">
                        View Details
                      </summary>
                      <div className="mt-2 space-y-2">
                        <div>
                          <h4 className="text-xs font-semibold text-gray-700 dark:text-gray-300">Request:</h4>
                          <pre className="text-xs bg-gray-100 dark:bg-gray-600 p-2 rounded overflow-x-auto">
                            {JSON.stringify(log.request, null, 2)}
                          </pre>
                        </div>
                        <div>
                          <h4 className="text-xs font-semibold text-gray-700 dark:text-gray-300">Response:</h4>
                          <pre className="text-xs bg-gray-100 dark:bg-gray-600 p-2 rounded overflow-x-auto">
                            {JSON.stringify(log.response, null, 2)}
                          </pre>
                        </div>
                      </div>
                    </details>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default StoryGeneratorApp;
