import { BadRequestException, Injectable, InternalServerErrorException, UnauthorizedException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { JwtService } from '@nestjs/jwt';
import * as bcryptjs from "bcryptjs";

import { User } from './entities/user.entity';

import { CreateUserDto, LoginDto, RegisterDto, UpdateAuthDto } from "./dto";

import { JwtPayload } from './interfaces/jwt-payload';
import { loginResponse } from './interfaces/login-response';


@Injectable()
export class AuthService {

  constructor(
    @InjectModel(User.name) 
    private userModel: Model<User>,
    private jwtService: JwtService
  ) {}

  async create(createUserDto:CreateUserDto): Promise<User> {

    try{
      const { password, ...userData } = createUserDto;

      const newUser = new this.userModel( {
        //1 Encriptar contraseña
        password: bcryptjs.hashSync( password, 10),
        ...userData
      } );
      //2 Guardar usuario
       await newUser.save();
       const { password:_, ...user } = newUser.toJSON();

      return user;
      //leer el bcryptjs

    } catch (error) {
      if( error.code === 11000 ){
        throw new BadRequestException(`${ createUserDto.email } already exists`)
      }
      throw new InternalServerErrorException('Something terrible happen')
    }
  }

  async register( registerDto:RegisterDto ): Promise<loginResponse>{

    const user = await this.create( registerDto );
    console.log({user})

    //RegisterDto se comporta igual que CreateDto por eso lo acepta

    return {
      user: user,
      token: this.getJWT({ id: user._id })
    }
  }

  async login( LoginDto:LoginDto ): Promise<loginResponse>{
    // * User * Token

    const { email, password } = LoginDto;

    const user = await this.userModel.findOne({email});

    if( !user ) {
      throw new UnauthorizedException('No valida credenciales');
    }
    
    if( !bcryptjs.compareSync( password, user.password ) ){
      throw new UnauthorizedException('No valida credenciales - password');
    }

    const { password:_, ...rest } = user.toJSON();

    return {
      user: rest,
      token: this.getJWT({ id: user.id })
    }
  }

  findAll(): Promise<User[]> {
    return this.userModel.find();
  }

  async findUserById( id:string ){
    const user = await this.userModel.findById(id);
    const { password, ...rest } = user.toJSON();

    return rest;
  }

  findOne(id: number) {
    return `This action returns a #${id} auth`;
  }

  update(id: number, updateAuthDto: UpdateAuthDto) {
    return `This action updates a #${id} auth`;
  }

  remove(id: number) {
    return `This action removes a #${id} auth`;
  }

  getJWT( payload: JwtPayload ){
    const token = this.jwtService.sign(payload);
    return token;
  }
}
