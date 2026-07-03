package dev.signalforge.ops;

import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import java.io.IOException;
import org.springframework.stereotype.Component;
import org.springframework.web.filter.OncePerRequestFilter;

@Component
public class OpsTelemetryFilter extends OncePerRequestFilter {

    private final OpsTelemetryService telemetryService;

    public OpsTelemetryFilter(OpsTelemetryService telemetryService) {
        this.telemetryService = telemetryService;
    }

    @Override
    protected void doFilterInternal(
            HttpServletRequest request,
            HttpServletResponse response,
            FilterChain filterChain)
            throws ServletException, IOException {
        long startedAt = System.nanoTime();

        try {
            filterChain.doFilter(request, response);
        } finally {
            long latencyMs = (System.nanoTime() - startedAt) / 1_000_000;
            telemetryService.record(request.getRequestURI(), response.getStatus(), latencyMs);
        }
    }
}
