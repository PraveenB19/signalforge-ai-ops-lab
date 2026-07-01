package dev.signalforge.api;

import static org.assertj.core.api.Assertions.assertThat;

import java.util.Map;
import org.junit.jupiter.api.Test;
import org.springframework.http.ResponseEntity;

class SimulationControllerTest {

    private final SimulationController controller = new SimulationController();

    @Test
    void latencyIsBoundedAndReturnsOk() throws InterruptedException {
        Map<String, Object> response = controller.latency(1);

        assertThat(response)
                .containsEntry("simulated", "latency")
                .containsEntry("requestedMs", 1L)
                .containsEntry("actualMs", 1L);
    }

    @Test
    void errorEndpointCanReturn503() {
        ResponseEntity<Map<String, Object>> response = controller.error(503);

        assertThat(response.getStatusCode().value()).isEqualTo(503);
        assertThat(response.getBody()).containsEntry("status", 503);
    }
}
