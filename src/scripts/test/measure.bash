measure_time() {
    local script=$1
    local iterations=100
    local total_time=0

    for ((i = 1; i <= iterations; i++)); do
        start_time=$(date +%s%N)
        bun $script >/dev/null 2>&1
        end_time=$(date +%s%N)
        duration=$((end_time - start_time))
        total_time=$((total_time + duration))
    done

    # Calculate average time in milliseconds
    average_time=$((total_time / iterations / 1000000))
    echo "Average time for $script: $average_time ms"
}