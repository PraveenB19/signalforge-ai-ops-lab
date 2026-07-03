package dev.signalforge.api;

import static org.assertj.core.api.Assertions.assertThat;

import java.util.Map;
import org.junit.jupiter.api.Test;

class HealthControllerTest {

    private final HealthController controller = new HealthController();

    @Test
    void healthReturnsUp() {
        Map<String, Object> response = controller.health();

        assertThat(response)
                .containsEntry("status", "UP")
                .containsEntry("service", "orbit")
                .containsKey("timestamp");
    }
}
