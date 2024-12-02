package ru.kata.spring.boot_security.demo.controllers;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.stereotype.Controller;
import org.springframework.ui.Model;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import ru.kata.spring.boot_security.demo.entity.User;
import ru.kata.spring.boot_security.demo.services.UserService;

import java.security.Principal;

@Controller
@RequestMapping("/user")
public class  UserController {

//    @GetMapping
//    public String userPage(Principal principal, Model model) {
//        User currentUser = userService.findByUsername(principal.getName());
//        if (currentUser == null) {
//            throw new RuntimeException("Current user is null");
//        }
//            model.addAttribute("currentUser", currentUser);
//        return "user-page";
//    }
     @GetMapping
        public String userPage() {
            return "user-page";
        }
}
