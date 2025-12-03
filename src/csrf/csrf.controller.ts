import { Controller, Get, Res, Req, HttpCode, HttpStatus } from '@nestjs/common';
import type { Response, Request } from 'express';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiCookieAuth,
} from '@nestjs/swagger';
import { CsrfService } from './csrf.service';

@ApiTags('csrf')
@Controller('csrf')
export class CsrfController {
  constructor(private readonly csrfService: CsrfService) {}

  @Get('token')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: 'Get CSRF token',
    description:
      'Generates a CSRF token and sets it in a cookie. The token should be included in the X-CSRF-Token header for protected requests.',
  })
  @ApiResponse({
    status: 200,
    description: 'CSRF token generated successfully',
    schema: {
      example: {
        csrfToken: 'csrf-token-string-here',
        message: 'CSRF token generated and set in cookie',
      },
    },
  })
  @ApiCookieAuth()
  getCsrfToken(@Req() req: Request, @Res() res: Response) {
    // Get existing secret from cookie or generate new one
    let secret: string = (req.cookies?.['csrf-secret'] as string) || '';

    if (!secret) {
      secret = this.csrfService.generateSecret();
      res.cookie('csrf-secret', secret, this.csrfService.getCookieOptions());
    }

    // Generate CSRF token from secret
    const token = this.csrfService.createToken(secret);

    // Return token in response body
    return res.json({
      csrfToken: token,
      message: 'CSRF token generated and set in cookie',
    });
  }
}
