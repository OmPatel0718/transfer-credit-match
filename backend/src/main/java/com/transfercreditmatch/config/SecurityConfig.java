package com.transfercreditmatch.config;

import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.http.HttpMethod;
import org.springframework.security.config.annotation.authentication.builders.AuthenticationManagerBuilder;
import org.springframework.security.config.annotation.method.configuration.EnableGlobalMethodSecurity;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.annotation.web.configuration.EnableWebSecurity;
import org.springframework.security.config.annotation.web.configuration.WebSecurityConfigurerAdapter;
import org.springframework.web.cors.CorsConfiguration;
import org.springframework.web.cors.CorsConfigurationSource;
import org.springframework.web.cors.UrlBasedCorsConfigurationSource;

import javax.sql.DataSource;
import java.util.Arrays;

@Configuration
@EnableWebSecurity
@EnableGlobalMethodSecurity(prePostEnabled = true)
public class SecurityConfig extends WebSecurityConfigurerAdapter {

    private final DataSource dataSource;

    // Inject your DataSource (e.g., from application.properties config)
    public SecurityConfig(DataSource dataSource) {
        this.dataSource = dataSource;
    }

    @Override
    protected void configure(AuthenticationManagerBuilder auth) throws Exception {
        auth.jdbcAuthentication()
            .dataSource(dataSource)
            // The query to load the user ("email" is our 'username')
            .usersByUsernameQuery("SELECT email, password_hash, true FROM users WHERE email=?")
            // The query to load the user's role(s)
            // We'll prefix them with "ROLE_" automatically
            .authoritiesByUsernameQuery("SELECT email, CONCAT('ROLE_', UPPER(role)) FROM users WHERE email=?")
            // For quick testing, no password encoder (plain text).
            // Use a real PasswordEncoder in production (e.g., BCrypt).
            .passwordEncoder(org.springframework.security.crypto.password.NoOpPasswordEncoder.getInstance());
    }

    @Override
    protected void configure(HttpSecurity http) throws Exception {
        http
            .cors().and()
            .csrf().disable()
            .authorizeRequests()
                // Auth endpoints open
                .antMatchers("/api/auth/**").permitAll()
                // Public read endpoints
                .antMatchers(HttpMethod.GET, "/api/institutions/**", "/api/programs/**", "/api/knowledge_units/**", "/api/summary").permitAll()
                // Write endpoints are admin/director only
                .antMatchers(HttpMethod.POST, "/api/institutions/**", "/api/programs/**", "/api/knowledge_units/**").hasAnyRole("ADMIN", "DIRECTOR")
                .antMatchers(HttpMethod.PUT, "/api/institutions/**", "/api/programs/**", "/api/knowledge_units/**").hasAnyRole("ADMIN", "DIRECTOR")
                .antMatchers(HttpMethod.DELETE, "/api/institutions/**", "/api/programs/**", "/api/knowledge_units/**").hasAnyRole("ADMIN", "DIRECTOR")
                // Match read endpoints are accessible by ADMIN, DIRECTOR, or STUDENT.
                .antMatchers(HttpMethod.GET, "/api/match/**").hasAnyRole("ADMIN","DIRECTOR","STUDENT")
                .antMatchers(HttpMethod.POST, "/api/match/course-ku").hasAnyRole("ADMIN","DIRECTOR")
                .antMatchers(HttpMethod.DELETE, "/api/match/course-ku").hasAnyRole("ADMIN","DIRECTOR")
                .antMatchers(HttpMethod.POST, "/api/match").hasAnyRole("ADMIN","DIRECTOR","STUDENT")
                // Allow course reads for authenticated users, writes for admin/director.
                .antMatchers(HttpMethod.GET, "/api/courses/**").hasAnyRole("ADMIN", "DIRECTOR", "STUDENT")
                .antMatchers(HttpMethod.POST, "/api/courses/**").hasAnyRole("ADMIN", "DIRECTOR")
                .antMatchers(HttpMethod.PUT, "/api/courses/**").hasAnyRole("ADMIN", "DIRECTOR")
                .antMatchers(HttpMethod.DELETE, "/api/courses/**").hasAnyRole("ADMIN", "DIRECTOR")
                // Current user profile endpoint for any authenticated user.
                .antMatchers(HttpMethod.GET, "/api/users/me").authenticated()
                // User management endpoints are admin/director only.
                .antMatchers("/api/users/**").hasAnyRole("ADMIN", "DIRECTOR")
                // Everything else => authenticated
                .anyRequest().authenticated()
            .and()
            .httpBasic();
    }

    // Example CORS config if needed:
    @Bean
    public CorsConfigurationSource corsConfigurationSource() {
        CorsConfiguration configuration = new CorsConfiguration();
        configuration.setAllowedOrigins(Arrays.asList("http://localhost:8000", "http://localhost:3000", "http://localhost:5173", "http://localhost:5174", "http://localhost:5175", "http://localhost:5176"));
        configuration.setAllowedMethods(Arrays.asList("GET","POST","PUT","DELETE","OPTIONS"));
        configuration.setAllowedHeaders(Arrays.asList("*"));
        configuration.setAllowCredentials(true);

        UrlBasedCorsConfigurationSource source = new UrlBasedCorsConfigurationSource();
        source.registerCorsConfiguration("/**", configuration);
        return source;
    }
}
