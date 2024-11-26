package ru.kata.spring.boot_security.demo.controllers;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Controller;
import org.springframework.ui.Model;
import org.springframework.web.bind.annotation.*;
import ru.kata.spring.boot_security.demo.entity.Role;
import ru.kata.spring.boot_security.demo.entity.User;
import ru.kata.spring.boot_security.demo.repositories.RoleRepository;
import ru.kata.spring.boot_security.demo.services.UserService;

import java.security.Principal;
import java.util.HashSet;
import java.util.List;
import java.util.Optional;
import java.util.Set;
import java.util.stream.Collectors;

@Controller
@RequestMapping("/admin")
public class AdminController {

    private final UserService userService;
    private final RoleRepository roleRepository;

    @Autowired
    public AdminController(UserService userService, RoleRepository roleRepository) {
        this.userService = userService;
        this.roleRepository = roleRepository;
    }

    // Главная страница для админа
    @GetMapping
    public String adminPage(Principal principal, Model model) {
        User currentUser = userService.findByUsername(principal.getName());
        List<User> users = userService.findAll();
        users.forEach(user -> System.out.println(user));
        List<String> roleNames = currentUser.getRoles().stream()
                .map(role -> role.getName().replace("ROLE_", ""))
                .collect(Collectors.toList());

        model.addAttribute("currentUser", currentUser);
        model.addAttribute("roleNames", roleNames);
        model.addAttribute("users", userService.findAll()); // Список всех пользователей
        model.addAttribute("roles", roleRepository.findAll()); // Список всех ролей
        model.addAttribute("user", new User()); // Пустой объект для формы
        return "admin";
    }




    // Создание нового пользователя
    @PostMapping("/new")
    public String createUser(@ModelAttribute("newUser") User user, @RequestParam("roles") Set<Long> roleIds) {
        Set<Role> roles = new HashSet<>();
        for (Long roleId : roleIds) {
            Optional<Role> role = roleRepository.findById(roleId);
            role.ifPresent(roles::add);
        }
        user.setRoles(roles);
        userService.save(user);
        return "redirect:/admin";
    }

    // Редактирование пользователя
    @PostMapping("/edit")
    public String editUser(@ModelAttribute("user") User user, @RequestParam("roles") Set<Long> roleIds) {
        // Установить роли пользователя
        Set<Role> roles = new HashSet<>();
        for (Long roleId : roleIds) {
            roleRepository.findById(roleId).ifPresent(roles::add);
        }
        user.setRoles(roles);

        // Если пароль пустой, оставить старый
        User existingUser = userService.findById(user.getId());
        if (user.getPassword() == null || user.getPassword().isEmpty()) {
            user.setPassword(existingUser.getPassword());
        } else {
            // Хэшировать новый пароль, если он был введен
            user.setPassword(userService.encodePassword(user.getPassword()));
        }

        userService.update(user);
        return "redirect:/admin";
    }





    // Удаление пользователя
    @PostMapping("/delete/{id}")
    public String deleteUser(@PathVariable("id") Long id) {
        userService.deleteById(id);
        return "redirect:/admin";
    }
}
