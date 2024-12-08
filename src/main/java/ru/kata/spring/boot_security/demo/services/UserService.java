package ru.kata.spring.boot_security.demo.services;

import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.stereotype.Service;
import ru.kata.spring.boot_security.demo.entity.Role;
import ru.kata.spring.boot_security.demo.entity.User;

import java.util.List;

@Service
public interface UserService extends UserDetailsService {
    User findById(Long id);

    List<User> findAll();

    User save(User user);

    User update(User user);

    void deleteById(Long id);

    User findByUsername(String email);

    UserDetails loadUserByUsername(String email);

    List<Role> findAllRoles();
}
