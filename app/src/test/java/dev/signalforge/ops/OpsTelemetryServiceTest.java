package dev.signalforge.ops;

import static org.assertj.core.api.Assertions.assertThat;

import java.util.Map;
import org.junit.jupiter.api.Test;

class OpsTelemetryServiceTest {

    @Test
    void emptySnapshotShowsNoErrors() {
        OpsTelemetryService service = new OpsTelemetryService();

        Map<String, Object> snapshot = service.snapshot();

        assertThat(snapshot)
                .containsEntry("requestRatePerMinute", 0L)
                .containsEntry("successRatePercent", 100.0)
                .containsEntry("http4xxRatePercent", 0.0)
                .containsEntry("http5xxRatePercent", 0.0);
    }

    @Test
    void snapshotCalculatesGoldenSignals() {
        OpsTelemetryService service = new OpsTelemetryService();

        service.record("/api/signals", 200, 40);
        service.record("/simulate/error", 502, 220);
        service.record("/simulate/error", 404, 18);

        Map<String, Object> snapshot = service.snapshot();

        assertThat(snapshot)
                .containsEntry("requestRatePerMinute", 3L)
                .containsEntry("http4xxRatePercent", 33.3)
                .containsEntry("http5xxRatePercent", 33.3)
                .containsEntry("p95Ms", 220L);
    }
}
