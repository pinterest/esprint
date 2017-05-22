lsof -i TCP:5004 | grep LISTEN | awk '{print $2}' | xargs kill -9
echo "Process found on port 5004 and killed"
