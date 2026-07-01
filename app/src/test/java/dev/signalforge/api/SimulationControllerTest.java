package dev.signalforge.api;

import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.test.web.servlet.MockMvc;

@SpringBootTest
@AutoConfigureMockMvc
class SimulationControllerTest {

    @Autowired
    private MockMvc mockMvc;

    @Test
    void latencyIsBoundedAndReturnsOk() throws Exception {
        mockMvc.perform(get("/simulate/latency?ms=1"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.simulated").value("latency"));
    }

    @Test
    void errorEndpointCanReturn503() throws Exception {
        mockMvc.perform(get("/simulate/error?status=503"))
                .andExpect(status().isServiceUnavailable())
                .andExpect(jsonPath("$.status").value(503));
    }
}

