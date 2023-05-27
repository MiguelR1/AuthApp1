import { Controller, Get, Post, Body, Patch, Param, Delete, UseGuards, Request } from '@nestjs/common';

import { AuthService } from './auth.service';
import { CreateUserDto, LoginDto, RegisterDto, UpdateAuthDto } from "./dto";
import { AuthGuard } from './guards/auth.guard';
import { User } from './entities/user.entity';
import { loginResponse } from './interfaces/login-response';

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post()
  create( @Body() createUserDto:CreateUserDto ) {
    return this.authService.create(createUserDto);
  }

  @Post('/register')
  register( @Body() RegisterDto:RegisterDto ){
    return this.authService.register(RegisterDto);
  }

  @Post('/login')
  login( @Body() LoginDto:LoginDto ){
    return this.authService.login(LoginDto);
  }

  @UseGuards( AuthGuard )
  @Get()
  findAll( @Request() req: Request ) {
    // const user = req['user'];
    // return user;
    return this.authService.findAll();
  }

  //Login response
  @UseGuards( AuthGuard )
  @Get('check-token')
  checkToken( @Request() req: Request ): loginResponse {
    
    const user = req['user'] as User;

    return {
      user,
      token: this.authService.getJWT({ id: user._id })
    }

  }

  // @Get(':id')
  // findOne(@Param('id') id: string) {
  //   return this.authService.findOne(+id);
  // }

  // @Patch(':id')
  // update(@Param('id') id: string, @Body() updateAuthDto: UpdateAuthDto) {
  //   return this.authService.update(+id, updateAuthDto);
  // }

  // @Delete(':id')
  // remove(@Param('id') id: string) {
  //   return this.authService.remove(+id);
  // }
}