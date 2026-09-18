package com.carvajal.lista_deseos.config;

import org.springframework.boot.web.servlet.FilterRegistrationBean;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

import com.carvajal.lista_deseos.filter.JwtValidationFilter;

@Configuration
public class FilterConfig {

    @Bean
    FilterRegistrationBean<JwtValidationFilter> jwtFilter(
            JwtValidationFilter jwtValidationFilter) {

        FilterRegistrationBean<JwtValidationFilter> filterRegistrationBean =
                new FilterRegistrationBean<>();

        filterRegistrationBean.setFilter(jwtValidationFilter);
        filterRegistrationBean.addUrlPatterns("/*");
        filterRegistrationBean.setOrder(1);

        return filterRegistrationBean;
    }
}

