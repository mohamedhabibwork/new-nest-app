import { Test, TestingModule } from '@nestjs/testing';
import { NotFoundException, ForbiddenException, BadRequestException } from '@nestjs/common';
import { TeamsController } from './teams.controller';
import { TeamsService } from './teams.service';
import { AddTeamMemberDto } from './dto/add-team-member.dto';

describe('TeamsController', () => {
  let controller: TeamsController;
  let teamsService: jest.Mocked<TeamsService>;

  const mockTeamsService = {
    getTeams: jest.fn(),
    addUserToTeam: jest.fn(),
    removeUserFromTeam: jest.fn(),
    getTeamMembers: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [TeamsController],
      providers: [
        {
          provide: TeamsService,
          useValue: mockTeamsService,
        },
      ],
    }).compile();

    controller = module.get<TeamsController>(TeamsController);
    teamsService = module.get(TeamsService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('getTeams', () => {
    it('should return teams for workspace', async () => {
      const workspaceId = '01ARZ3NDEKTSV4RRFFQ69G5FAV';

      const mockTeams = [
        {
          id: '01ARZ3NDEKTSV4RRFFQ69G5FAV',
          workspaceId,
          teamName: 'Development Team',
          description: 'Main development team',
          createdAt: new Date(),
          updatedAt: new Date(),
        },
      ];

      teamsService.getTeams.mockResolvedValue(mockTeams);

      const result = await controller.getTeams(workspaceId);

      expect(teamsService.getTeams).toHaveBeenCalledWith(workspaceId, undefined);
      expect(result).toEqual(mockTeams);
    });

    it('should return teams filtered by userId', async () => {
      const userId = '01ARZ3NDEKTSV4RRFFQ69G5FAV';

      const mockTeams = [
        {
          id: '01ARZ3NDEKTSV4RRFFQ69G5FAV',
          workspaceId: '01ARZ3NDEKTSV4RRFFQ69G5FAV',
          teamName: 'Development Team',
          createdAt: new Date(),
          updatedAt: new Date(),
        },
      ];

      teamsService.getTeams.mockResolvedValue(mockTeams);

      const result = await controller.getTeams(undefined, userId);

      expect(teamsService.getTeams).toHaveBeenCalledWith(undefined, userId);
      expect(result).toEqual(mockTeams);
    });

    it('should return empty array when no teams found', async () => {
      teamsService.getTeams.mockResolvedValue([]);

      const result = await controller.getTeams();

      expect(teamsService.getTeams).toHaveBeenCalledWith(undefined, undefined);
      expect(result).toEqual([]);
    });
  });

  describe('addMember', () => {
    const mockRequest = {
      user: {
        id: '01ARZ3NDEKTSV4RRFFQ69G5FAV',
      },
    };

    const teamId = '01ARZ3NDEKTSV4RRFFQ69G5FAV';
    const addDto: AddTeamMemberDto = {
      userId: '01ARZ3NDEKTSV4RRFFQ69G5FAV',
    };

    it('should add team member successfully', async () => {
      const mockTeamMember = {
        id: '01ARZ3NDEKTSV4RRFFQ69G5FAV',
        teamId,
        userId: addDto.userId,
        joinedAt: new Date(),
        user: {
          id: addDto.userId,
          email: 'user@example.com',
          name: 'John Doe',
        },
      };

      teamsService.addUserToTeam.mockResolvedValue(mockTeamMember);

      const result = await controller.addMember(teamId, addDto, mockRequest);

      expect(teamsService.addUserToTeam).toHaveBeenCalledWith(
        teamId,
        addDto.userId,
        mockRequest.user.id,
      );
      expect(result).toEqual(mockTeamMember);
    });

    it('should throw NotFoundException when team not found', async () => {
      teamsService.addUserToTeam.mockRejectedValue(new NotFoundException('Team not found'));

      await expect(controller.addMember(teamId, addDto, mockRequest)).rejects.toThrow(
        NotFoundException,
      );
    });

    it('should throw BadRequestException when user already a member', async () => {
      teamsService.addUserToTeam.mockRejectedValue(
        new BadRequestException('User is already a member of this team'),
      );

      await expect(controller.addMember(teamId, addDto, mockRequest)).rejects.toThrow(
        BadRequestException,
      );
    });

    it('should throw ForbiddenException when user has no permission', async () => {
      teamsService.addUserToTeam.mockRejectedValue(
        new ForbiddenException('You do not have permission to manage team members'),
      );

      await expect(controller.addMember(teamId, addDto, mockRequest)).rejects.toThrow(
        ForbiddenException,
      );
    });
  });

  describe('removeMember', () => {
    const mockRequest = {
      user: {
        id: '01ARZ3NDEKTSV4RRFFQ69G5FAV',
      },
    };

    const teamId = '01ARZ3NDEKTSV4RRFFQ69G5FAV';
    const userId = '01ARZ3NDEKTSV4RRFFQ69G5FAV';

    it('should remove team member successfully', async () => {
      teamsService.removeUserFromTeam.mockResolvedValue({
        message: 'User removed from team successfully',
      });

      const result = await controller.removeMember(teamId, userId, mockRequest);

      expect(teamsService.removeUserFromTeam).toHaveBeenCalledWith(
        teamId,
        userId,
        mockRequest.user.id,
      );
      expect(result).toEqual({ message: 'User removed from team successfully' });
    });

    it('should throw NotFoundException when team member not found', async () => {
      teamsService.removeUserFromTeam.mockRejectedValue(
        new NotFoundException('User is not a member of this team'),
      );

      await expect(
        controller.removeMember(teamId, userId, mockRequest),
      ).rejects.toThrow(NotFoundException);
    });

    it('should throw ForbiddenException when user has no permission', async () => {
      teamsService.removeUserFromTeam.mockRejectedValue(
        new ForbiddenException('You do not have permission to manage team members'),
      );

      await expect(
        controller.removeMember(teamId, userId, mockRequest),
      ).rejects.toThrow(ForbiddenException);
    });
  });

  describe('getMembers', () => {
    const teamId = '01ARZ3NDEKTSV4RRFFQ69G5FAV';

    it('should return team members', async () => {
      const mockMembers = [
        {
          id: '01ARZ3NDEKTSV4RRFFQ69G5FAV',
          teamId,
          userId: '01ARZ3NDEKTSV4RRFFQ69G5FAV',
          joinedAt: new Date(),
          user: {
            id: '01ARZ3NDEKTSV4RRFFQ69G5FAV',
            email: 'user@example.com',
            name: 'John Doe',
          },
        },
      ];

      teamsService.getTeamMembers.mockResolvedValue(mockMembers);

      const result = await controller.getMembers(teamId);

      expect(teamsService.getTeamMembers).toHaveBeenCalledWith(teamId);
      expect(result).toEqual(mockMembers);
    });

    it('should throw NotFoundException when team not found', async () => {
      teamsService.getTeamMembers.mockRejectedValue(new NotFoundException('Team not found'));

      await expect(controller.getMembers(teamId)).rejects.toThrow(NotFoundException);
    });
  });
});

