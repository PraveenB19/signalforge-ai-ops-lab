package dev.signalforge.ops;

import java.time.Instant;
import java.util.ArrayList;
import java.util.Comparator;
import java.util.DoubleSummaryStatistics;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;
import java.util.concurrent.ConcurrentLinkedDeque;
import java.util.stream.Collectors;
import org.springframework.stereotype.Service;

@Service
public class OpsTelemetryService {

    private static final long WINDOW_SECONDS = 60;
    private static final int MAX_EVENTS = 1_000;

    private final ConcurrentLinkedDeque<RequestSample> samples = new ConcurrentLinkedDeque<>();

    public void record(String path, int status, long latencyMs) {
        if (path.startsWith("/styles") || path.startsWith("/app.js")) {
            return;
        }

        samples.addLast(new RequestSample(Instant.now(), path, status, latencyMs));

        while (samples.size() > MAX_EVENTS) {
            samples.pollFirst();
        }
    }

    public Map<String, Object> snapshot() {
        Instant cutoff = Instant.now().minusSeconds(WINDOW_SECONDS);
        List<RequestSample> recent = samples.stream()
                .filter(sample -> sample.timestamp().isAfter(cutoff))
                .toList();

        long total = recent.size();
        long fourXx = countStatus(recent, 400, 499);
        long fiveXx = countStatus(recent, 500, 599);
        long success = recent.stream().filter(sample -> sample.status() < 400).count();
        List<Long> latencies = recent.stream()
                .map(RequestSample::latencyMs)
                .sorted()
                .toList();

        DoubleSummaryStatistics latencyStats = latencies.stream()
                .mapToDouble(Long::doubleValue)
                .summaryStatistics();

        Map<String, Long> topPaths = recent.stream()
                .collect(Collectors.groupingBy(RequestSample::path, Collectors.counting()))
                .entrySet()
                .stream()
                .sorted(Map.Entry.<String, Long>comparingByValue(Comparator.reverseOrder()))
                .limit(5)
                .collect(Collectors.toMap(Map.Entry::getKey, Map.Entry::getValue));

        Map<String, Object> snapshot = new LinkedHashMap<>();
        snapshot.put("windowSeconds", WINDOW_SECONDS);
        snapshot.put("requestRatePerMinute", total);
        snapshot.put("successRatePercent", total == 0 ? 100.0 : percent(success, total));
        snapshot.put("http4xxRatePercent", percent(fourXx, total));
        snapshot.put("http5xxRatePercent", percent(fiveXx, total));
        snapshot.put("p50Ms", percentile(latencies, 50));
        snapshot.put("p95Ms", percentile(latencies, 95));
        snapshot.put("p99Ms", percentile(latencies, 99));
        snapshot.put("avgLatencyMs", Math.round(latencyStats.getAverage()));
        snapshot.put("healthyTargets", 2);
        snapshot.put("expectedTargets", 2);
        snapshot.put("listeningPort", 8080);
        snapshot.put("topPaths", topPaths);
        snapshot.put("recentEvents", recent.stream()
                .skip(Math.max(0, recent.size() - 8))
                .map(sample -> Map.of(
                        "path", sample.path(),
                        "status", sample.status(),
                        "latencyMs", sample.latencyMs(),
                        "timestamp", sample.timestamp().toString()))
                .toList());
        return snapshot;
    }

    private long countStatus(List<RequestSample> recent, int start, int end) {
        return recent.stream()
                .filter(sample -> sample.status() >= start && sample.status() <= end)
                .count();
    }

    private long percentile(List<Long> sortedValues, int percentile) {
        if (sortedValues.isEmpty()) {
            return 0;
        }

        int index = (int) Math.ceil((percentile / 100.0) * sortedValues.size()) - 1;
        return sortedValues.get(Math.max(0, Math.min(index, sortedValues.size() - 1)));
    }

    private double percent(long numerator, long denominator) {
        if (denominator == 0) {
            return 0.0;
        }

        return Math.round((numerator * 1000.0) / denominator) / 10.0;
    }

    private record RequestSample(Instant timestamp, String path, int status, long latencyMs) {}
}
