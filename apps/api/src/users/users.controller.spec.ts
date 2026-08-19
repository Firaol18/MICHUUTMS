import { Test, TestingModule } from '@nestjs/testing';
import { UsersController } from './users.controller';
import { UsersService } from './users.service';

describe('UsersController', () => {
  let controller: UsersController;
  let serviceMock: any;

  beforeEach(async () => {
    serviceMock = {
      getUsers: jest.fn(),
      getUsersPaginated: jest.fn(),
      getUserById: jest.fn(),
      createUser: jest.fn(),
      updateUser: jest.fn(),
      deleteUser: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      controllers: [UsersController],
      providers: [
        {
          provide: UsersService,
          useValue: serviceMock,
        },
      ],
    }).compile();

    controller = module.get<UsersController>(UsersController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('getUsersPaginated', () => {
    it('should call service.getUsersPaginated with query parameters and filters', async () => {
      const mockResult = {
        data: [],
        meta: { total: 0, page: 1, limit: 10, totalPages: 0 },
      };
      serviceMock.getUsersPaginated.mockResolvedValue(mockResult);

      const query = { page: 2, limit: 5, search: 'Alice', isActive: true };
      const result = await controller.getUsersPaginated(query);

      expect(serviceMock.getUsersPaginated).toHaveBeenCalledWith(2, 5, 'Alice', true);
      expect(result).toEqual(mockResult);
    });
  });
});
