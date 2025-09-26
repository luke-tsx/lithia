import { useState, useEffect } from 'react';
import { useSocket } from '@/contexts/SocketContext';
import type { Route, RequestResponse } from '@/types';
import { Send, Loader2, AlertCircle, CheckCircle, Code } from 'lucide-react';

interface RequestBuilderProps {
  route: Route | null;
  onSend: (response: RequestResponse) => void;
}

export function RequestBuilder({ route, onSend }: RequestBuilderProps) {
  const [payload, setPayload] = useState(
    '{\n  "name": "Lucas",\n  "age": 21\n}',
  );
  const [response, setResponse] = useState<RequestResponse | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { config } = useSocket();

  // Reset payload when route changes
  useEffect(() => {
    if (route) {
      setPayload('{\n  "name": "Lucas",\n  "age": 21\n}');
      setResponse(null);
      setError(null);
    }
  }, [route]);

  const handleSend = async () => {
    if (!route || !config) return;

    setLoading(true);
    setError(null);
    setResponse(null);

    try {
      let parsedPayload;
      try {
        parsedPayload = JSON.parse(payload);
      } catch (e) {
        throw new Error('Invalid JSON payload');
      }

      const url = `http://localhost:${config.lithiaPort}${route.path}`;
      const options: RequestInit = {
        method: route.method || 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      };

      if (route.method && route.method !== 'GET') {
        options.body = JSON.stringify(parsedPayload);
      }

      const res = await fetch(url, options);
      const data = await res.json();

      const responseData: RequestResponse = {
        status: res.status,
        statusText: res.statusText,
        data,
        headers: Object.fromEntries(res.headers.entries()),
      };

      setResponse(responseData);
      onSend(responseData);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Request failed');
    } finally {
      setLoading(false);
    }
  };

  if (!route) {
    return (
      <div className="flex flex-col items-center justify-center h-64 space-y-4">
        <Code className="w-12 h-12 text-dark-500" />
        <div className="text-center">
          <div className="text-dark-400 font-medium">No route selected</div>
          <div className="text-sm text-dark-500 mt-1">
            Choose an endpoint from the left panel to start testing
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Route Info */}
      <div className="lithia-card p-6">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-3">
            <span
              className={`method-badge method-${route.method?.toLowerCase() || 'get'}`}
            >
              {route.method?.toUpperCase() || 'GET'}
            </span>
            <span className="text-white font-mono text-lg">{route.path}</span>
          </div>
          <div className="text-sm text-dark-400">
            {route.dynamic ? (
              <span className="text-lithia-primary bg-primary/10 px-2 py-1 rounded-md">
                Dynamic Route
              </span>
            ) : (
              <span className="text-dark-500">Static Route</span>
            )}
          </div>
        </div>
        <div className="text-sm text-dark-400">
          <span className="font-mono">
            http://localhost:{config?.lithiaPort || '3000'}
            {route.path}
          </span>
        </div>
      </div>

      {/* JSON Payload */}
      <div>
        <label className="block text-sm font-medium text-white mb-3">
          Request Payload
        </label>
        <textarea
          value={payload}
          onChange={(e) => setPayload(e.target.value)}
          className="json-editor w-full h-40 resize-none"
          placeholder="Enter JSON payload..."
          disabled={route.method === 'GET'}
        />
        {route.method === 'GET' && (
          <p className="text-xs text-dark-500 mt-2 flex items-center gap-1">
            <AlertCircle className="w-3 h-3" />
            GET requests don't support body payload
          </p>
        )}
      </div>

      {/* Send Button */}
      <div className="flex justify-end">
        <button
          onClick={handleSend}
          disabled={loading}
          className="send-button disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
        >
          {loading ? (
            <>
              <Loader2 className="w-4 h-4 animate-spin" />
              SENDING...
            </>
          ) : (
            <>
              <Send className="w-4 h-4" />
              SEND REQUEST
            </>
          )}
        </button>
      </div>

      {/* Response */}
      {response && (
        <div>
          <label className="block text-sm font-medium text-white mb-3">
            Response
          </label>
          <div className="json-editor">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <CheckCircle className="w-4 h-4 text-lithia-primary" />
                <span className="text-sm font-medium text-lithia-primary">
                  Request Successful
                </span>
              </div>
              <div className="text-sm text-dark-400">
                Status:{' '}
                <span className="font-mono text-white">
                  {response.status} {response.statusText}
                </span>
              </div>
            </div>
            <pre className="text-lithia-primary whitespace-pre-wrap font-mono text-sm">
              {JSON.stringify(response.data, null, 2)}
            </pre>
          </div>
        </div>
      )}

      {/* Error */}
      {error && (
        <div className="lithia-card p-4 border-red-500/50 bg-red-500/5">
          <div className="flex items-center gap-2 mb-2">
            <AlertCircle className="w-4 h-4 text-red-400" />
            <div className="font-semibold text-red-400">Request Failed</div>
          </div>
          <div className="text-red-300 text-sm">{error}</div>
        </div>
      )}
    </div>
  );
}
