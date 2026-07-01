package dev.signalforge.api;

import java.time.Instant;
import java.util.List;
import java.util.Map;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api")
public class SignalController {

    @GetMapping("/signals")
    public List<Map<String, Object>> signals() {
        return List.of(
                Map.of("name", "latency", "value", "normal", "timestamp", Instant.now().toString()),
                Map.of("name", "error_rate", "value", "normal", "timestamp", Instant.now().toString()),
                Map.of("name", "saturation", "value", "normal", "timestamp", Instant.now().toString()));
    }

    @GetMapping("/incidents")
    public List<Map<String, Object>> incidents() {
        return List.of(
                Map.of(
                        "id", "INC-1001",
                        "title", "High latency simulation",
                        "severity", "training",
                        "status", "resolved"));
    }
}

