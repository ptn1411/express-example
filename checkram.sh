ps aux --sort=-%mem | awk '{print $6/1024 " MB\t\t" $2 "\t" $11}' | head -n 11 && echo "Number of CPUs: $(nproc)"
