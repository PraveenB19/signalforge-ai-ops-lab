package dev.signalforge.api;

import dev.signalforge.ops.OpsTelemetryService;
import java.util.Map;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/ops")
public class OpsController {

    private final OpsTelemetryService telemetryService;

    public OpsController(OpsTelemetryService telemetryService) {
        this.telemetryService = telemetryService;
    }

    @GetMapping("/snapshot")
    public Map<String, Object> snapshot() {
        return telemetryService.snapshot();
    }
}
