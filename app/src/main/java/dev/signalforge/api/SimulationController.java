package dev.signalforge.api;

import java.time.Duration;
import java.time.Instant;
import java.util.ArrayList;
import java.util.List;
import java.util.Map;
import java.util.concurrent.TimeUnit;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.server.ResponseStatusException;

@RestController
@RequestMapping("/simulate")
public class SimulationController {

    private final List<byte[]> memoryPressure = new ArrayList<>();

    @GetMapping("/latency")
    public Map<String, Object> latency(@RequestParam(defaultValue = "1000") long ms) throws InterruptedException {
        long boundedMs = Math.min(Math.max(ms, 0), 30_000);
        TimeUnit.MILLISECONDS.sleep(boundedMs);
        return Map.of("simulated", "latency", "requestedMs", ms, "actualMs", boundedMs);
    }

    @GetMapping("/cpu")
    public Map<String, Object> cpu(@RequestParam(defaultValue = "10") long seconds) {
        long boundedSeconds = Math.min(Math.max(seconds, 1), 60);
        Instant end = Instant.now().plus(Duration.ofSeconds(boundedSeconds));
        long iterations = 0;

        while (Instant.now().isBefore(end)) {
            iterations++;
            Math.sqrt(iterations);
        }

        return Map.of("simulated", "cpu", "seconds", boundedSeconds, "iterations", iterations);
    }

    @GetMapping("/memory")
    public Map<String, Object> memory(@RequestParam(defaultValue = "64") int mb) {
        int boundedMb = Math.min(Math.max(mb, 1), 512);
        memoryPressure.add(new byte[boundedMb * 1024 * 1024]);
        return Map.of(
                "simulated", "memory",
                "allocatedMb", boundedMb,
                "retainedChunks", memoryPressure.size());
    }

    @GetMapping("/memory/clear")
    public Map<String, Object> clearMemory() {
        int chunks = memoryPressure.size();
        memoryPressure.clear();
        return Map.of("clearedChunks", chunks);
    }

    @GetMapping("/error")
    public ResponseEntity<Map<String, Object>> error(@RequestParam(defaultValue = "500") int status) {
        if (status < 400 || status > 599) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "status must be between 400 and 599");
        }

        return ResponseEntity.status(status)
                .body(Map.of("simulated", "http_error", "status", status));
    }
}

