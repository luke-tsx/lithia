import { useState, useEffect } from 'react';
import { useLithia } from '@/contexts/LithiaContext';
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
  const { config } = useLithia();

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
      } catch {
        throw new Error('Invalid JSON payload');
      }

      const url = `http://localhost:${config.server.port}${route.path}`;
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
      <div className="flex h-64 flex-col items-center justify-center space-y-4">
        <Code className="text-dark-500 h-12 w-12" />
        <div className="text-center">
          <div className="text-dark-400 font-medium">No route selected</div>
          <div className="text-dark-500 mt-1 text-sm">
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
        <div className="mb-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <span
              className={`method-badge method-${route.method?.toLowerCase() || 'get'}`}
            >
              {route.method?.toUpperCase() || 'GET'}
            </span>
            <span className="font-mono text-lg text-white">{route.path}</span>
          </div>
          <div className="text-dark-400 text-sm">
            {route.dynamic ? (
              <span className="text-lithia-primary bg-lithia-primary/10 rounded-md px-2 py-1">
                Dynamic Route
              </span>
            ) : (
              <span className="text-dark-500">Static Route</span>
            )}
          </div>
        </div>
        <div className="text-dark-400 text-sm">
          <span className="font-mono">
            http://localhost:{config?.server.port || '3000'}
            {route.path}
          </span>
        </div>
      </div>

      {/* JSON Payload */}
      <div>
        <label className="mb-3 block text-sm font-medium text-white">
          Request Payload
        </label>
        <textarea
          value={payload}
          onChange={(e) => setPayload(e.target.value)}
          className="json-editor h-40 w-full resize-none"
          placeholder="Enter JSON payload..."
          disabled={route.method === 'GET'}
        />
        {route.method === 'GET' && (
          <p className="text-dark-500 mt-2 flex items-center gap-1 text-xs">
            <AlertCircle className="h-3 w-3" />
            GET requests don't support body payload
          </p>
        )}
      </div>

      {/* Send Button */}
      <div className="flex justify-end">
        <button
          onClick={handleSend}
          disabled={loading}
          className="send-button flex items-center gap-2 disabled:cursor-not-allowed disabled:opacity-50"
        >
          {loading ? (
            <>
              <Loader2 className="h-4 w-4 animate-spin" />
              SENDING...
            </>
          ) : (
            <>
              <Send className="h-4 w-4" />
              SEND REQUEST
            </>
          )}
        </button>
      </div>

      {/* Response */}
      {response && (
        <div>
          <label className="mb-3 block text-sm font-medium text-white">
            Response
          </label>
          <div className="json-editor">
            <div className="mb-4 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <CheckCircle className="text-lithia-primary h-4 w-4" />
                <span className="text-lithia-primary text-sm font-medium">
                  Request Successful
                </span>
              </div>
              <div className="text-dark-400 text-sm">
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
        <div className="lithia-card border-red-500/50 bg-red-500/5 p-4">
          <div className="mb-2 flex items-center gap-2">
            <AlertCircle className="h-4 w-4 text-red-400" />
            <div className="font-semibold text-red-400">Request Failed</div>
          </div>
          <div className="text-sm text-red-300">{error}</div>
        </div>
      )}
    </div>
  );
}
