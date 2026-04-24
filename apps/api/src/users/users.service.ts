import { Injectable } from '@nestjs/common';
import { CreateUserDto } from './dto/create-user.dto';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class UsersService {
  constructor(private readonly prisma: PrismaService) {}

  create(dto: CreateUserDto) {
    return this.prisma.user.create({
      data: {
        email: dto.email,
        name: dto.name,
      },
    });
  }

  findAll() {
    return this.prisma.user.findMany();
  }
}
