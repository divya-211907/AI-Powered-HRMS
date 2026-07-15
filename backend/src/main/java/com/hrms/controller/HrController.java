package com.hrms.controller;

import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/hr")
@CrossOrigin("*")
public class HrController {

	@GetMapping("/hr/home")
	public String home() {
	    return "HR Home Page";
	}


}
