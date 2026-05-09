package com.transfercreditmatch;

import com.transfercreditmatch.repositories.*;
import org.springframework.boot.CommandLineRunner;
import org.springframework.context.annotation.Bean;
import org.springframework.stereotype.Component;

@Component
public class DbTestRunner {

    private final UserRepository userRepository;
    private final InstitutionRepository institutionRepository;
    private final ProgramRepository programRepository;
    private final CourseRepository courseRepository;
    private final KnowledgeUnitRepository knowledgeUnitRepository;
    private final CourseKuRepository courseKuRepository;
    private final StudentRepository studentRepository;
    private final DirectorRepository directorRepository;
    private final AdminRepository adminRepository;
    private final CourseMatchRepository courseMatchRepository;
    private final TransferRequestRepository transferRequestRepository;
    private final MatchHistoryRepository matchHistoryRepository;

    public DbTestRunner(
            UserRepository userRepository,
            InstitutionRepository institutionRepository,
            ProgramRepository programRepository,
            CourseRepository courseRepository,
            KnowledgeUnitRepository knowledgeUnitRepository,
            CourseKuRepository courseKuRepository,
            StudentRepository studentRepository,
            DirectorRepository directorRepository,
            AdminRepository adminRepository,
            CourseMatchRepository courseMatchRepository,
            TransferRequestRepository transferRequestRepository,
            MatchHistoryRepository matchHistoryRepository
    ) {
        this.userRepository = userRepository;
        this.institutionRepository = institutionRepository;
        this.programRepository = programRepository;
        this.courseRepository = courseRepository;
        this.knowledgeUnitRepository = knowledgeUnitRepository;
        this.courseKuRepository = courseKuRepository;
        this.studentRepository = studentRepository;
        this.directorRepository = directorRepository;
        this.adminRepository = adminRepository;
        this.courseMatchRepository = courseMatchRepository;
        this.transferRequestRepository = transferRequestRepository;
        this.matchHistoryRepository = matchHistoryRepository;
    }

    @Bean
    public CommandLineRunner testDbConnection() {
        return args -> {
            System.out.println(">>> DbTestRunner is running! <<<");
            System.out.println("Users: " + userRepository.count());
            System.out.println("Institutions: " + institutionRepository.count());
            System.out.println("Programs: " + programRepository.count());
            System.out.println("Courses: " + courseRepository.count());
            System.out.println("KnowledgeUnits: " + knowledgeUnitRepository.count());
            System.out.println("CourseKu: " + courseKuRepository.count());
            System.out.println("Students: " + studentRepository.count());
            System.out.println("Directors: " + directorRepository.count());
            System.out.println("Admins: " + adminRepository.count());
            System.out.println("CourseMatch: " + courseMatchRepository.count());
            System.out.println("TransferRequests: " + transferRequestRepository.count());
            System.out.println("MatchHistory: " + matchHistoryRepository.count());
        };
    }
}
