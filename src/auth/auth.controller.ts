import {
  Controller,
  Post,
  Body,

} from '@nestjs/common';
import { AuthService } from './auth.service';
import { SignupDto } from './dto/signup.dto';
import { LoginDto } from './dto/login.dto';

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) { }


  // POST register
  @Post('register')
  async signup(@Body() signupData: SignupDto) {
    return this.authService.signup(signupData);
  }




  // POST LOGIN
  @Post('login')
  async login(@Body() loginData: LoginDto) {
    return this.authService.login(loginData);
  }


}