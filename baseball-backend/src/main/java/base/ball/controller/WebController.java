package base.ball.controller;

import org.springframework.stereotype.Controller;
import org.springframework.web.bind.annotation.GetMapping;

@Controller
public class WebController {
	@GetMapping(value = {"", "/", "/ticket/**", "/login", "/board/**", "/foodmapKIWOOM", "/foodmapLG", "/foodmapSSG", "/foodmapKIA", "/fooddetail/**", "/payment/**", "/members/**", "/weather", "/foodmain", "/mypage/**", "/goods/**", "/gameDetail", "/gameAddPage", "/signup/**"})
	public String forward() {
		return "forward:/index.html";
	}
  
}