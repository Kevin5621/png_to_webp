#!/bin/bash

# Debug script untuk troubleshooting network issues

echo "🔍 PNG to WebP Converter - Network Debug"
echo "========================================"

# Test backend health
echo "🏥 Testing backend health..."
response=$(curl -s -w "HTTPSTATUS:%{http_code}" http://127.0.0.1:8080/health)
http_code=$(echo $response | tr -d '\n' | sed -E 's/.*HTTPSTATUS:([0-9]{3})$/\1/')
body=$(echo $response | sed -E 's/HTTPSTATUS:[0-9]{3}$//')

if [ "$http_code" -eq 200 ]; then
    echo "✅ Backend is healthy: $body"
else
    echo "❌ Backend health check failed (HTTP $http_code)"
    echo "Body: $body"
fi

echo ""

# Test CORS preflight
echo "🌐 Testing CORS preflight..."
cors_response=$(curl -s -w "HTTPSTATUS:%{http_code}" \
    -H "Origin: http://localhost:3000" \
    -H "Access-Control-Request-Method: POST" \
    -H "Access-Control-Request-Headers: content-type" \
    -X OPTIONS \
    http://127.0.0.1:8080/api/convert)

cors_http_code=$(echo $cors_response | tr -d '\n' | sed -E 's/.*HTTPSTATUS:([0-9]{3})$/\1/')

if [ "$cors_http_code" -eq 200 ]; then
    echo "✅ CORS preflight successful"
else
    echo "❌ CORS preflight failed (HTTP $cors_http_code)"
fi

echo ""

# Check if processes are running
echo "🔍 Checking running processes..."
backend_pid=$(pgrep -f "png-to-webp-backend" || echo "")
frontend_pid=$(pgrep -f "next-server" || pgrep -f "next dev" || echo "")

if [ -n "$backend_pid" ]; then
    echo "✅ Backend process running (PID: $backend_pid)"
else
    echo "❌ Backend process not found"
fi

if [ -n "$frontend_pid" ]; then
    echo "✅ Frontend process running (PID: $frontend_pid)"
else
    echo "❌ Frontend process not found"
fi

echo ""

# Check ports
echo "🔌 Checking ports..."
backend_port=$(netstat -tlnp 2>/dev/null | grep ":8080 " || ss -tlnp 2>/dev/null | grep ":8080 " || echo "")
frontend_port=$(netstat -tlnp 2>/dev/null | grep ":3000 " || ss -tlnp 2>/dev/null | grep ":3000 " || echo "")

if [ -n "$backend_port" ]; then
    echo "✅ Port 8080 is listening"
else
    echo "❌ Port 8080 is not listening"
fi

if [ -n "$frontend_port" ]; then
    echo "✅ Port 3000 is listening"
else
    echo "❌ Port 3000 is not listening"
fi

echo ""

# Test file upload simulation
echo "📁 Testing file upload (simulation)..."
if command -v curl >/dev/null 2>&1; then
    # Create a small test PNG (1x1 pixel)
    test_png_data="iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNkYPhfDwAChwGA60e6kgAAAABJRU5ErkJggg=="
    echo "$test_png_data" | base64 -d > /tmp/test.png 2>/dev/null
    
    if [ -f "/tmp/test.png" ]; then
        echo "🧪 Uploading test PNG..."
        upload_response=$(curl -s -w "HTTPSTATUS:%{http_code}" \
            -X POST \
            -H "Origin: http://localhost:3000" \
            -F "image=@/tmp/test.png" \
            http://127.0.0.1:8080/api/convert)
        
        upload_http_code=$(echo $upload_response | tr -d '\n' | sed -E 's/.*HTTPSTATUS:([0-9]{3})$/\1/')
        upload_body=$(echo $upload_response | sed -E 's/HTTPSTATUS:[0-9]{3}$//')
        
        if [ "$upload_http_code" -eq 200 ]; then
            echo "✅ File upload test successful"
            echo "Response preview: $(echo $upload_body | cut -c1-100)..."
        else
            echo "❌ File upload test failed (HTTP $upload_http_code)"
            echo "Error: $upload_body"
        fi
        
        rm -f /tmp/test.png
    else
        echo "⚠️  Could not create test PNG file"
    fi
else
    echo "⚠️  curl not available for upload test"
fi

echo ""
echo "🎯 Recommendations:"

if [ "$http_code" -ne 200 ]; then
    echo "- Start backend: cd backend && cargo run"
fi

if [ -z "$frontend_pid" ]; then
    echo "- Start frontend: cd frontend && npm run dev"
fi

if [ "$cors_http_code" -ne 200 ]; then
    echo "- Check CORS configuration in backend/src/main.rs"
fi

echo "- Check browser console for detailed error messages"
echo "- Verify NEXT_PUBLIC_API_URL in frontend/.env.local"
echo "- Try using 127.0.0.1 instead of localhost in URLs"
