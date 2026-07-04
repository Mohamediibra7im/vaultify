import { Controller, Post, Get, Patch, Param, Body, UseGuards } from '@nestjs/common';
import { ContactService } from './contact.service';
import { JwtOrApiTokenGuard } from '../common/guards/jwt-or-api-token.guard';
import { IsEmail, IsString, MinLength } from 'class-validator';

class CreateContactDto {
  @IsString()
  @MinLength(1)
  name!: string;

  @IsEmail()
  email!: string;

  @IsString()
  @MinLength(1)
  subject!: string;

  @IsString()
  @MinLength(1)
  message!: string;
}

@Controller('contact')
export class ContactController {
  constructor(private readonly contact: ContactService) {}

  @Post()
  create(@Body() dto: CreateContactDto) {
    return this.contact.create(dto);
  }

  @UseGuards(JwtOrApiTokenGuard)
  @Get()
  findAll() {
    return this.contact.findAll();
  }

  @UseGuards(JwtOrApiTokenGuard)
  @Patch(':id/read')
  markRead(@Param('id') id: string) {
    return this.contact.markRead(id);
  }
}
