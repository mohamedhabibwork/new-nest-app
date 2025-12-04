import { Test, TestingModule } from '@nestjs/testing';
import { NotFoundException, BadRequestException } from '@nestjs/common';
import { CompaniesController } from './companies.controller';
import { CompaniesService } from './companies.service';
import { CreateCompanyDto } from './dto/create-company.dto';
import { UpdateCompanyDto } from './dto/update-company.dto';
import { CompanyQueryDto } from './dto/company-query.dto';

describe('CompaniesController', () => {
  let controller: CompaniesController;
  let companiesService: jest.Mocked<CompaniesService>;

  const mockCompaniesService = {
    create: jest.fn(),
    findAll: jest.fn(),
    findOne: jest.fn(),
    update: jest.fn(),
    remove: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [CompaniesController],
      providers: [
        {
          provide: CompaniesService,
          useValue: mockCompaniesService,
        },
      ],
    }).compile();

    controller = module.get<CompaniesController>(CompaniesController);
    companiesService = module.get(CompaniesService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('create', () => {
    const mockRequest = {
      user: {
        id: '01ARZ3NDEKTSV4RRFFQ69G5FAV',
      },
    };

    const createDto: CreateCompanyDto = {
      name: 'Acme Corporation',
      domain: 'acme.com',
      industry: 'Technology',
      companyType: 'prospect',
    };

    it('should create a company successfully', async () => {
      const mockCompany = {
        id: '01ARZ3NDEKTSV4RRFFQ69G5FAV',
        name: 'Acme Corporation',
        domain: 'acme.com',
        industry: 'Technology',
        companyType: 'prospect',
        ownerId: mockRequest.user.id,
        isDeleted: false,
        createdAt: new Date(),
        updatedAt: new Date(),
        owner: {
          id: mockRequest.user.id,
          email: 'owner@example.com',
          firstName: 'Owner',
          lastName: 'User',
        },
      };

      companiesService.create.mockResolvedValue(mockCompany);

      const result = await controller.create(mockRequest, createDto);

      expect(companiesService.create).toHaveBeenCalledWith(
        mockRequest.user.id,
        createDto,
      );
      expect(result).toEqual(mockCompany);
    });

    it('should throw BadRequestException when domain already exists', async () => {
      companiesService.create.mockRejectedValue(
        new BadRequestException('Company with this domain already exists'),
      );

      await expect(controller.create(mockRequest, createDto)).rejects.toThrow(
        BadRequestException,
      );
      expect(companiesService.create).toHaveBeenCalledWith(
        mockRequest.user.id,
        createDto,
      );
    });

    it('should throw NotFoundException when parent company not found', async () => {
      const createDtoWithParent: CreateCompanyDto = {
        ...createDto,
        parentCompanyId: '01ARZ3NDEKTSV4RRFFQ69G5FAV',
      };

      companiesService.create.mockRejectedValue(
        new NotFoundException('Parent company not found'),
      );

      await expect(
        controller.create(mockRequest, createDtoWithParent),
      ).rejects.toThrow(NotFoundException);
    });
  });

  describe('findAll', () => {
    const queryDto: CompanyQueryDto = {
      page: 1,
      limit: 50,
    };

    it('should return paginated companies', async () => {
      const mockResponse = {
        data: [
          {
            id: '01ARZ3NDEKTSV4RRFFQ69G5FAV',
            name: 'Acme Corporation',
            domain: 'acme.com',
            industry: 'Technology',
          },
        ],
        pagination: {
          page: 1,
          limit: 50,
          total: 1,
          totalPages: 1,
          hasNext: false,
          hasPrevious: false,
        },
      };

      companiesService.findAll.mockResolvedValue(mockResponse);

      const result = await controller.findAll(queryDto);

      expect(companiesService.findAll).toHaveBeenCalledWith(queryDto);
      expect(result).toEqual(mockResponse);
    });

    it('should return filtered companies by industry', async () => {
      const queryDtoWithFilter: CompanyQueryDto = {
        ...queryDto,
        industry: 'Technology',
      };

      const mockResponse = {
        data: [],
        pagination: {
          page: 1,
          limit: 50,
          total: 0,
          totalPages: 0,
          hasNext: false,
          hasPrevious: false,
        },
      };

      companiesService.findAll.mockResolvedValue(mockResponse);

      const result = await controller.findAll(queryDtoWithFilter);

      expect(companiesService.findAll).toHaveBeenCalledWith(queryDtoWithFilter);
      expect(result).toEqual(mockResponse);
    });

    it('should return filtered companies by parent company', async () => {
      const queryDtoWithParent: CompanyQueryDto = {
        ...queryDto,
        parentCompanyId: '01ARZ3NDEKTSV4RRFFQ69G5FAV',
      };

      const mockResponse = {
        data: [],
        pagination: {
          page: 1,
          limit: 50,
          total: 0,
          totalPages: 0,
          hasNext: false,
          hasPrevious: false,
        },
      };

      companiesService.findAll.mockResolvedValue(mockResponse);

      const result = await controller.findAll(queryDtoWithParent);

      expect(companiesService.findAll).toHaveBeenCalledWith(queryDtoWithParent);
      expect(result).toEqual(mockResponse);
    });

    it('should return filtered companies by search', async () => {
      const queryDtoWithSearch: CompanyQueryDto = {
        ...queryDto,
        search: 'Acme',
      };

      const mockResponse = {
        data: [],
        pagination: {
          page: 1,
          limit: 50,
          total: 0,
          totalPages: 0,
          hasNext: false,
          hasPrevious: false,
        },
      };

      companiesService.findAll.mockResolvedValue(mockResponse);

      const result = await controller.findAll(queryDtoWithSearch);

      expect(companiesService.findAll).toHaveBeenCalledWith(queryDtoWithSearch);
      expect(result).toEqual(mockResponse);
    });
  });

  describe('findOne', () => {
    const companyId = '01ARZ3NDEKTSV4RRFFQ69G5FAV';

    it('should return company by ID', async () => {
      const mockCompany = {
        id: companyId,
        name: 'Acme Corporation',
        domain: 'acme.com',
        industry: 'Technology',
        companyType: 'prospect',
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      companiesService.findOne.mockResolvedValue(mockCompany);

      const result = await controller.findOne(companyId);

      expect(companiesService.findOne).toHaveBeenCalledWith(companyId);
      expect(result).toEqual(mockCompany);
    });

    it('should throw NotFoundException when company not found', async () => {
      companiesService.findOne.mockRejectedValue(
        new NotFoundException('Company not found'),
      );

      await expect(controller.findOne(companyId)).rejects.toThrow(
        NotFoundException,
      );
      expect(companiesService.findOne).toHaveBeenCalledWith(companyId);
    });
  });

  describe('update', () => {
    const mockRequest = {
      user: {
        id: '01ARZ3NDEKTSV4RRFFQ69G5FAV',
      },
    };

    const companyId = '01ARZ3NDEKTSV4RRFFQ69G5FAV';
    const updateDto: UpdateCompanyDto = {
      name: 'Updated Company Name',
      industry: 'Finance',
    };

    it('should update company successfully', async () => {
      const mockCompany = {
        id: companyId,
        name: 'Updated Company Name',
        domain: 'acme.com',
        industry: 'Finance',
        companyType: 'prospect',
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      companiesService.update.mockResolvedValue(mockCompany);

      const result = await controller.update(companyId, mockRequest, updateDto);

      expect(companiesService.update).toHaveBeenCalledWith(
        companyId,
        mockRequest.user.id,
        updateDto,
      );
      expect(result).toEqual(mockCompany);
    });

    it('should throw NotFoundException when company not found', async () => {
      companiesService.update.mockRejectedValue(
        new NotFoundException('Company not found'),
      );

      await expect(
        controller.update(companyId, mockRequest, updateDto),
      ).rejects.toThrow(NotFoundException);
    });
  });

  describe('remove', () => {
    const mockRequest = {
      user: {
        id: '01ARZ3NDEKTSV4RRFFQ69G5FAV',
      },
    };

    const companyId = '01ARZ3NDEKTSV4RRFFQ69G5FAV';

    it('should delete company successfully', async () => {
      companiesService.remove.mockResolvedValue({
        message: 'Company deleted successfully',
      });

      const result = await controller.remove(companyId, mockRequest);

      expect(companiesService.remove).toHaveBeenCalledWith(
        companyId,
        mockRequest.user.id,
      );
      expect(result).toEqual({ message: 'Company deleted successfully' });
    });

    it('should throw NotFoundException when company not found', async () => {
      companiesService.remove.mockRejectedValue(
        new NotFoundException('Company not found'),
      );

      await expect(controller.remove(companyId, mockRequest)).rejects.toThrow(
        NotFoundException,
      );
    });

    it('should throw BadRequestException when company has contacts or subsidiaries', async () => {
      companiesService.remove.mockRejectedValue(
        new BadRequestException(
          'Cannot delete company with contacts or subsidiaries',
        ),
      );

      await expect(controller.remove(companyId, mockRequest)).rejects.toThrow(
        BadRequestException,
      );
    });
  });
});
