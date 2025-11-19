import { Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { CreateUserDto } from '../../user/dtos/create-user.dto';
import { UserService } from '../../user/user.service';
import { UpdateUserDto } from '../../user/dtos/update-user.dto';
import { LoginDto } from '../dto/login.dto';

@Injectable()
export class AuthService {
  constructor(
    private userService: UserService,
    private jwtService: JwtService
  ) {}

  // Handles user registration
  async signup(dto: CreateUserDto) {
    if (dto.signupAccessCode !== process.env.SIGNUP_ACCESS_CODE) {
      throw new Error('Invalid signup access code');
    }

    const existingUser = await this.userService.findUserByEmail(dto.email);
    if (existingUser) {
      throw new Error('User already exists');
    }

    return this.userService.create(dto);
  }

  // Handles user login and token generation
  async login(dto: LoginDto) {
    const user = await this.userService.findUserByEmail(dto.email);
    if (!user) throw new UnauthorizedException('Invalid credentials');

    const isValid = await this.userService.validatePassword(dto.password, user.password);
    if (!isValid) throw new UnauthorizedException('Invalid credentials');

    // Create token with userId as the subject (identifier)
    const token = this.jwtService.sign({
      sub: user.id,
      email: user.email,
    });

    return { access_token: token };
  }

  async updateUser(userId: string, dto: UpdateUserDto) {
    return this.userService.update(userId, dto);
  }
}
