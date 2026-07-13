export interface Translation {
  layout: {
    appName: string;
  };
  projectSelector: {
    triggerLabel: string;
    listLabel: string;
    listHeading: string;
    cardLabel: string;
    emptyLabel: string;
  };
  nav: {
    aria: string;
    openMenu: string;
    closeMenu: string;
    sectionGeneral: string;
    sectionMySpace: string;
    dashboard: string;
    users: string;
    rolesPermissions: string;
    projects: string;
    analytics: string;
    seoActivities: string;
    leads: string;
    reports: string;
    settings: string;
  };
  breadcrumb: {
    /** First crumb linking to `/dashboard` on nested pages */
    root: string;
    new: string;
    edit: string;
  };
  table: {
    emptyTitle: string;
    emptyBody: string;
    loading: string;
  };
  form: {
    showPassword: string;
    hidePassword: string;
    pickImage: string;
    changeImage: string;
  };
  userMenu: {
    openMenu: string;
    menuLabel: string;
    settings: string;
    editProfile: string;
    changePassword: string;
    logOut: string;
    fallbackName: string;
    noEmail: string;
    emailVerified: string;
    emailNotVerified: string;
    resendVerification: string;
  };
  settings: {
    title: string;
    subtitle: string;
  };
  profile: {
    changePassword: {
      title: string;
      lead: string;
      currentPassword: string;
      currentPasswordPh: string;
      newPassword: string;
      newPasswordPh: string;
      confirmPassword: string;
      confirmPasswordPh: string;
      submit: string;
      submitting: string;
      successTitle: string;
      successFallback: string;
      errorTitle: string;
      errorFallback: string;
      valRequired: string;
      valMin: string;
      valMatch: string;
      cancel: string;
    };
    edit: {
      breadcrumbTitle: string;
      title: string;
      lead: string;
      loading: string;
      loadErrorTitle: string;
      loadErrorBody: string;
      saving: string;
      save: string;
      successTitle: string;
      successFallback: string;
      errorTitle: string;
      errorFallback: string;
      nameLabel: string;
      namePh: string;
      valRequired: string;
      valMin: string;
      photoLabel: string;
      photoHint: string;
      photoPick: string;
      photoChange: string;
      photoClear: string;
      noChanges: string;
      sectionReadonly: string;
      emailLabel: string;
      rolesHeading: string;
      permissionsHeading: string;
      noRoles: string;
      noPermissions: string;
      linkChangePassword: string;
    };
  };
  home: {
    title: string;
    subtitle: string;
  };
  modules: {
    users: {
      title: string;
      subtitle: string;
      createUserTitle: string;
      table: {
        searchPlaceholder: string;
        sortLabel: string;
        sortToggle: string;
        sortNewest: string;
        sortOldest: string;
        colUser: string;
        colRole: string;
        colStatus: string;
        colLastAction: string;
        colActions: string;
        statusActive: string;
        statusInvited: string;
        noRoles: string;
        lastActionVerified: string;
        lastActionCreated: string;
        showingUsers: string;
        pageNumber: string;
        loading: string;
        emptyTitle: string;
        emptyBody: string;
        viewUser: string;
        editUser: string;
        createUser: string;
        previousPage: string;
        nextPage: string;
        updating: string;
        loadErrorTitle: string;
        loadErrorBody: string;
        accessDeniedTitle: string;
        accessDeniedBody: string;
      };
    };
    projects: {
      title: string;
      subtitle: string;
      emptyTitle: string;
      emptyBody: string;
      emailNotVerifiedTitle: string;
      emailNotVerifiedBody: string;
      verifyEmailTooltip: string;
      verifyEmailCta: string;
      listTitle: string;
      createProjectTitle: string;
      statusFilter: {
        ariaLabel: string;
        all: string;
        active: string;
        pending: string;
        inactive: string;
        rejected: string;
        emptyTitle: string;
        emptyBody: string;
      };
      cardActions: {
        approve: string;
        decline: string;
        active: string;
        inactive: string;
        pending: string;
        viewDetails: string;
        editProject: string;
        moreActions: string;
        errorFallback: string;
        success: {
          approve: string;
          decline: string;
          active: string;
          inactive: string;
        };
      };
      seoGoals: {
        grow_brand_awareness: string;
        outrank_competitors: string;
        get_more_calls: string;
        increase_online_orders: string;
        improve_local_visibility: string;
      };
      listCard: {
        projectOwnerLabel: string;
        projectOwnerFallback: string;
      };
      editProjectTitle: string;
      detail: {
        backToProjects: string;
        pageLead: string;
        editProject: string;
        loading: string;
        notFoundTitle: string;
        notFoundBody: string;
        loadErrorTitle: string;
        loadErrorBody: string;
        website: string;
        contactNumber: string;
        contactEmail: string;
        address: string;
        sectionBusinessTitle: string;
        sectionBusinessLead: string;
        sectionServicesTitle: string;
        sectionServicesLead: string;
        sectionSeoGoalsTitle: string;
        sectionSeoGoalsLead: string;
        sectionIcpTitle: string;
        sectionIcpLead: string;
        sectionLocationsTitle: string;
        sectionLocationsLead: string;
        sectionCompetitorsTitle: string;
        sectionCompetitorsLead: string;
        sidebarSummaryTitle: string;
        sidebarProjectId: string;
        sidebarStatus: string;
        timelineTitle: string;
        timelineCreated: string;
        timelineApproved: string;
        timelineRejected: string;
        timelineUpdated: string;
        businessHours: string;
        noValue: string;
        noServices: string;
        noLocations: string;
        noSeoGoals: string;
        noCompetitors: string;
      };
      createLead: string;
      createForm: {
        title: string;
        lead: string;
        editTitle: string;
        editLead: string;
        sectionBusinessTitle: string;
        sectionBusinessLead: string;
        sectionSeoTitle: string;
        sectionSeoLead: string;
        sectionGoogleTitle: string;
        sectionGoogleLead: string;
        sectionCmsTitle: string;
        sectionCmsLead: string;
        businessName: string;
        businessNamePh: string;
        ownerUserId: string;
        ownerUserIdPh: string;
        websiteUrl: string;
        websiteUrlPh: string;
        businessAddress: string;
        businessAddressPh: string;
        companyLogo: string;
        companyLogoHint: string;
        pocContactNumber: string;
        pocContactNumberPh: string;
        pocEmail: string;
        sectionServiceTitle: string;
        sectionServiceLead: string;
        servicesOffered: string;
        servicesOfferedPh: string;
        primaryServiceToPromote: string;
        primaryServiceToPromotePh: string;
        idealCustomerProfile: string;
        idealCustomerProfilePh: string;
        sectionOperationsTitle: string;
        sectionOperationsLead: string;
        opensAt: string;
        closesAt: string;
        valTime: string;
        sectionMarketingTitle: string;
        sectionMarketingLead: string;
        websiteLogin: string;
        websiteLoginPh: string;
        websiteHosting: string;
        websiteHostingPh: string;
        googleAnalytics: string;
        googleAnalyticsPh: string;
        googleSearchConsole: string;
        googleSearchConsolePh: string;
        googleBusinessProfile: string;
        googleBusinessProfilePh: string;
        websiteLoginShared: string;
        websiteLoginSharedDesc: string;
        websiteHostingShared: string;
        websiteHostingSharedDesc: string;
        googleAnalyticsShared: string;
        googleAnalyticsSharedDesc: string;
        googleSearchConsoleShared: string;
        googleSearchConsoleSharedDesc: string;
        googleBusinessProfileShared: string;
        googleBusinessProfileSharedDesc: string;
        sectionCompetitorsTitle: string;
        sectionCompetitorsLead: string;
        competitorUrls: string;
        competitorUrlsPh: string;
        industryNiche: string;
        industryNichePh: string;
        industryNicheLoading: string;
        industryNicheLoadError: string;
        targetLocations: string;
        targetLocationsPh: string;
        targetLocationsHelp: string;
        isB2b: string;
        isB2bDesc: string;
        isB2c: string;
        isB2cDesc: string;
        briefDescription: string;
        briefDescriptionPh: string;
        briefDescriptionHelp: string;
        seoGoals: string;
        seoGoalsHelp: string;
        seoGoalsLoading: string;
        seoGoalsLoadError: string;
        seoGoalsEmpty: string;
        hasGoogleAnalytics: string;
        hasGoogleAnalyticsDesc: string;
        hasGoogleSearchConsole: string;
        hasGoogleSearchConsoleDesc: string;
        hasGoogleTagManager: string;
        hasGoogleTagManagerDesc: string;
        hasGoogleAds: string;
        hasGoogleAdsDesc: string;
        googleConnect: string;
        googleConnectError: string;
        hasWebsiteLoginDetails: string;
        hasWebsiteLoginDetailsDesc: string;
        cmsLoginPageUrl: string;
        cmsLoginPageUrlPh: string;
        cmsUsername: string;
        cmsUsernamePh: string;
        cmsPassword: string;
        cmsPasswordPh: string;
        cmsPasswordEditPh: string;
        cmsPasswordEditHelp: string;
        submit: string;
        submitting: string;
        editSubmit: string;
        editSubmitting: string;
        successTitle: string;
        successFallback: string;
        editSuccessTitle: string;
        editSuccessFallback: string;
        errorTitle: string;
        errorFallback: string;
        editErrorTitle: string;
        editErrorFallback: string;
        missingProjectAccess: string;
        nextStep: string;
        previousStep: string;
        stepValidationError: string;
        valRequired: string;
        valMin: string;
        valUrl: string;
        valTargetLocations: string;
        valSeoGoals: string;
        backToList: string;
        remove: string;
      };
      table: {
        toolbarHint: string;
        colId: string;
        colBusinessName: string;
        colWebsite: string;
        colBusinessType: string;
        colActions: string;
        createProject: string;
        noBusinessType: string;
        businessTypeB2b: string;
        businessTypeB2c: string;
        rowsSelected: string;
        rowsPerPage: string;
        pageOf: string;
        firstPage: string;
        previousPage: string;
        nextPage: string;
        lastPage: string;
        updating: string;
        loadErrorTitle: string;
        loadErrorBody: string;
        edit: string;
        delete: string;
        more: string;
        moreView: string;
        deleteConfirmTitle: string;
        deleteConfirmDescription: string;
        deleteConfirmCancel: string;
        deleteConfirmAction: string;
        deleteInProgress: string;
        deleteSuccessTitle: string;
        deleteSuccessFallback: string;
        deleteErrorTitle: string;
        dismiss: string;
        detailSheetLead: string;
        accessDeniedTitle: string;
        accessDeniedBody: string;
        yes: string;
        no: string;
        colIsB2b: string;
        colIsB2c: string;
        colIndustryNiche: string;
        colIndustryOther: string;
        colTargetLocations: string;
        colBriefDescription: string;
        colMainCompetitors: string;
        colSeoGoals: string;
        colSeoGoalOther: string;
        colGoogleAnalytics: string;
        colGoogleSearchConsole: string;
        colGoogleTagManager: string;
        colGoogleAds: string;
        colWebsiteLoginDetails: string;
        colCmsLoginUrl: string;
        colCmsUsername: string;
        colCmsPasswordSet: string;
        colCreatedAt: string;
        colUpdatedAt: string;
      };
    };
    analytics: {
      title: string;
    };
    seoActivities: {
      title: string;
    };
    leads: {
      title: string;
    };
    reports: {
      title: string;
    };
    roles: {
      title: string;
      subtitle: string;
      createRoleTitle: string;
      editRoleTitle: string;
      createForm: {
        title: string;
        lead: string;
        editTitle: string;
        editLead: string;
        editSubmit: string;
        editSubmitting: string;
        editSuccessTitle: string;
        editSuccessFallback: string;
        editErrorTitle: string;
        editErrorFallback: string;
        name: string;
        namePh: string;
        permsHeading: string;
        permsSelectAll: string;
        permsCount: string;
        permsLoading: string;
        permsEmpty: string;
        permsLoadErrorTitle: string;
        permsLoadErrorBody: string;
        submit: string;
        submitting: string;
        successTitle: string;
        successFallback: string;
        errorTitle: string;
        errorFallback: string;
        valRequired: string;
        valMin: string;
        backToList: string;
      };
      table: {
        searchPlaceholder: string;
        sortLabel: string;
        sortToggle: string;
        sortNewest: string;
        sortOldest: string;
        colRole: string;
        colScope: string;
        colPermissions: string;
        colMembers: string;
        colSystem: string;
        colActions: string;
        scopePlatform: string;
        scopeProject: string;
        permissionsCount: string;
        systemYes: string;
        systemNo: string;
        showingRoles: string;
        pageNumber: string;
        loading: string;
        emptyTitle: string;
        emptyBody: string;
        viewRole: string;
        editRole: string;
        createRole: string;
        previousPage: string;
        nextPage: string;
        updating: string;
        loadErrorTitle: string;
        loadErrorBody: string;
        accessDeniedTitle: string;
        accessDeniedBody: string;
      };
    };
  };
  auth: {
    signIn: {
      title: string;
      subtitle: string;
      email: string;
      password: string;
      submit: string;
      forgotPassword: string;
      heroTitleStart: string;
      heroTitleAccent: string;
      heroLead: string;
      heroPoint1: string;
      heroPoint2: string;
      heroPoint3: string;
      continueWith: string;
      continueGoogle: string;
      continueSso: string;
      emailInvalid: string;
      passwordMin: string;
      fieldRequired: string;
      loginSuccess: string;
      loginErrorUnexpected: string;
      emailVerifiedSuccess: string;
      registrationSuccess: string;
      noAccountPrompt: string;
      registerCta: string;
    };
    forgotPassword: {
      title: string;
      subtitle: string;
      email: string;
      submit: string;
      backToSignIn: string;
      emailInvalid: string;
      fieldRequired: string;
      submitSuccess: string;
      submitErrorFallback: string;
    };
    resetPassword: {
      title: string;
      subtitle: string;
      password: string;
      confirmPassword: string;
      submit: string;
      backToSignIn: string;
      fieldRequired: string;
      passwordMin: string;
      passwordMismatch: string;
      submitSuccess: string;
      submitErrorFallback: string;
      invalidLinkTitle: string;
      invalidLinkBody: string;
    };
    register: {
      title: string;
      subtitle: string;
      fullName: string;
      fullNamePh: string;
      fullNameMin: string;
      email: string;
      password: string;
      confirmPassword: string;
      passwordMin: string;
      passwordMismatch: string;
      submit: string;
      hasAccount: string;
      signInLink: string;
      fieldRequired: string;
      emailInvalid: string;
      submitSuccess: string;
      submitErrorFallback: string;
    };
    verification: {
      title: string;
      description: string;
      resendCta: string;
      resendSuccess: string;
      resendErrorFallback: string;
    };
  };
  lang: {
    en: string;
    ar: string;
    aria: string;
    switchToArabic: string;
    switchToEnglish: string;
  };
  theme: {
    switchToLight: string;
    switchToDark: string;
  };
}

const translation: Translation = {
  layout: {
    appName: "RankRadar",
  },
  projectSelector: {
    triggerLabel: "Selected Project: {{name}}",
    listLabel: "Switch Project",
    listHeading: "Your Projects",
    cardLabel: "Project",
    emptyLabel: "No Projects Available",
  },
  nav: {
    aria: "Main Navigation",
    openMenu: "Open Menu",
    closeMenu: "Close Menu",
    sectionGeneral: "General",
    sectionMySpace: "My Space",
    dashboard: "Dashboard",
    users: "Users",
    rolesPermissions: "Roles & Permissions",
    projects: "Projects",
    analytics: "Analytics",
    seoActivities: "SEO Activities",
    leads: "Leads",
    reports: "Reports",
    settings: "Settings",
  },
  breadcrumb: {
    root: "Dashboard",
    new: "New",
    edit: "Edit",
  },
  table: {
    emptyTitle: "No Records Found",
    emptyBody: "There Is Nothing To Show Here Yet. Create A New Entry Or Check Back Later.",
    loading: "Loading…",
  },
  form: {
    showPassword: "Show password",
    hidePassword: "Hide password",
    pickImage: "Upload Image",
    changeImage: "Change Image",
  },
  userMenu: {
    openMenu: "Account menu",
    menuLabel: "Account actions",
    settings: "Settings",
    editProfile: "Edit profile",
    changePassword: "Change password",
    logOut: "Log out",
    fallbackName: "User",
    noEmail: "No email on file",
    emailVerified: "Your Email is Verified",
    emailNotVerified: "Your Email is not Verified",
    resendVerification: "Tap to resend verification email",
  },
  settings: {
    title: "Settings",
    subtitle: "Account and workspace preferences will live here.",
  },
  profile: {
    changePassword: {
      title: "Change Password",
      lead: "Update Your Password. Use A Strong, Unique Password You Don't Reuse Elsewhere.",
      currentPassword: "Current Password",
      currentPasswordPh: "Enter Your Current Password",
      newPassword: "New Password",
      newPasswordPh: "At Least 8 Characters",
      confirmPassword: "Confirm New Password",
      confirmPasswordPh: "Re-Enter Your New Password",
      submit: "Update Password",
      submitting: "Updating…",
      successTitle: "Password Updated",
      successFallback: "Your Password Has Been Changed.",
      errorTitle: "Could Not Update Password",
      errorFallback: "Something Went Wrong. Try Again.",
      valRequired: "This Field Is Required.",
      valMin: "Use At Least 8 Characters.",
      valMatch: "Passwords Do Not Match.",
      cancel: "Cancel",
    },
    edit: {
      breadcrumbTitle: "Edit Profile",
      title: "Your Profile",
      lead: "Update Your Display Name And Photo. Email Cannot Be Changed Here.",
      loading: "Loading Profile…",
      loadErrorTitle: "Could Not Load Profile",
      loadErrorBody: "Check Your Connection And Try Again.",
      saving: "Saving…",
      save: "Save Changes",
      successTitle: "Profile Updated",
      successFallback: "Your Changes Were Saved.",
      errorTitle: "Could Not Save Profile",
      errorFallback: "Something Went Wrong. Try Again.",
      nameLabel: "Display Name",
      namePh: "Your Name",
      valRequired: "This Field Is Required.",
      valMin: "Use At Least 2 Characters.",
      photoLabel: "Profile Photo",
      photoHint: "JPG, PNG, WEBP, Or GIF. Max 5 MB.",
      photoPick: "Upload Photo",
      photoChange: "Change Photo",
      photoClear: "Remove New Photo",
      noChanges: "No Profile Changes To Save.",
      sectionReadonly: "Account details",
      emailLabel: "Email",
      rolesHeading: "Roles",
      permissionsHeading: "Permissions",
      noRoles: "No roles assigned.",
      noPermissions: "No permissions on this account.",
      linkChangePassword: "Change password",
    },
  },
  home: {
    title: "Dashboard",
    subtitle: "Overview — add widgets and KPIs for your SEO workspace here.",
  },
  modules: {
    users: {
      title: "Users",
      subtitle: "Manage Users And Their Access In Your Workspace.",
      createUserTitle: "Create User",
      table: {
        searchPlaceholder: "Search Users...",
        sortLabel: "Sort",
        sortToggle: "Sort By {{direction}}",
        sortNewest: "Newest",
        sortOldest: "Oldest",
        colUser: "User",
        colRole: "Role",
        colStatus: "Status",
        colLastAction: "Last Action",
        colActions: "Actions",
        statusActive: "Active",
        statusInvited: "Invited",
        noRoles: "No Role",
        lastActionVerified: "Email Verified",
        lastActionCreated: "Account Created",
        showingUsers: "Showing {{from}} To {{to}} Of {{total}} Users",
        pageNumber: "Page {{page}}",
        loading: "Loading Users...",
        emptyTitle: "No Users Found",
        emptyBody: "Try Another Search Or Clear Filters To View All Users.",
        viewUser: "View {{name}}",
        editUser: "Edit {{name}}",
        createUser: "Add User",
        previousPage: "Previous Page",
        nextPage: "Next Page",
        updating: "Updating…",
        loadErrorTitle: "Could Not Load Users",
        loadErrorBody: "Check Your Connection And Try Again.",
        accessDeniedTitle: "No Access",
        accessDeniedBody: "You Don't Have Permission To View Users. Ask An Administrator If You Need Access.",
      },
    },
    projects: {
      title: "Projects",
      subtitle: "Manage SEO projects in your workspace.",
      emptyTitle: "No Projects Found",
      emptyBody: "Create Your First Project To Complete Onboarding Or Ask An Admin To Assign You To A Project.",
      emailNotVerifiedTitle: "Email Not Verified",
      emailNotVerifiedBody: "Verify Your Email Before Creating A Project.",
      verifyEmailTooltip: "Verify Your Email Before Creating A Project.",
      verifyEmailCta: "Verify Email",
      listTitle: "Projects",
      createProjectTitle: "Create A New Project",
      statusFilter: {
        ariaLabel: "Filter Projects By Status",
        all: "All Projects",
        active: "Active",
        pending: "Pending Approval",
        inactive: "Inactive",
        rejected: "Rejected",
        emptyTitle: "No Projects Match This Filter",
        emptyBody: "Try Another Status Or View All Projects.",
      },
      cardActions: {
        approve: "Approve",
        decline: "Decline",
        active: "Activate",
        inactive: "Deactivate",
        pending: "Pending",
        viewDetails: "View Details",
        editProject: "Edit Project",
        moreActions: "More Actions",
        errorFallback: "Could Not Update Project Status.",
        success: {
          approve: "Project Approved Successfully.",
          decline: "Project Rejected Successfully.",
          active: "Project Activated Successfully.",
          inactive: "Project Deactivated Successfully.",
        },
      },
      seoGoals: {
        grow_brand_awareness: "Grow Brand Awareness",
        outrank_competitors: "Outrank Competitors",
        get_more_calls: "Get More Calls",
        increase_online_orders: "Increase Online Orders",
        improve_local_visibility: "Improve Local Visibility",
      },
      listCard: {
        projectOwnerLabel: "Project Owner",
        projectOwnerFallback: "Project Owner",
      },
      editProjectTitle: "Edit Project",
      detail: {
        backToProjects: "Back To Projects",
        pageLead: "Manage All Information, Integrations, And SEO Settings For This Project.",
        editProject: "Edit Project",
        loading: "Loading Project…",
        notFoundTitle: "Project Not Found",
        notFoundBody: "This Project May Have Been Removed Or You Do Not Have Access.",
        loadErrorTitle: "Could Not Load Project",
        loadErrorBody: "Check Your Connection And Try Again.",
        website: "Website",
        contactNumber: "Contact Number",
        contactEmail: "Contact Email",
        address: "Address",
        sectionBusinessTitle: "Business Information",
        sectionBusinessLead: "Core Business Details Collected During Onboarding.",
        sectionServicesTitle: "Services Offered",
        sectionServicesLead: "Services The Business Provides To Clients.",
        sectionSeoGoalsTitle: "SEO Goals",
        sectionSeoGoalsLead: "Select The Outcomes This Project Should Drive. Pick All That Apply.",
        sectionIcpTitle: "Ideal Customer Profile",
        sectionIcpLead: "Who The Business Wants To Reach.",
        sectionLocationsTitle: "Target Locations",
        sectionLocationsLead: "Geographic Areas This Project Focuses On.",
        sectionCompetitorsTitle: "Competitors",
        sectionCompetitorsLead: "Competitor Websites Provided For Benchmarking.",
        sidebarSummaryTitle: "Project Summary",
        sidebarProjectId: "Project ID",
        sidebarStatus: "Status",
        timelineTitle: "Timeline",
        timelineCreated: "Created",
        timelineApproved: "Approved",
        timelineRejected: "Rejected",
        timelineUpdated: "Last Updated",
        businessHours: "Business Hours",
        noValue: "Not Provided",
        noServices: "No Services Listed.",
        noLocations: "No Target Locations Listed.",
        noSeoGoals: "No SEO Goals Selected.",
        noCompetitors: "No Competitors Listed.",
      },
      createLead: "Add Your Business Information To Start This Project.",
      createForm: {
        title: "Project details",
        lead: "Fill in the business basics, SEO goals, and access information for this project.",
        editTitle: "Edit Project",
        editLead: "Update the project's business details, SEO goals, and access information.",
        sectionBusinessTitle: "Business basics",
        sectionBusinessLead: "Tell us what the business does and who it serves.",
        sectionSeoTitle: "SEO Goals",
        sectionSeoLead: "Select The Outcomes This Project Should Drive. Pick All That Apply.",
        sectionGoogleTitle: "Google tools",
        sectionGoogleLead: "Which Google products are connected for this site?",
        sectionCmsTitle: "CMS access",
        sectionCmsLead: "Optional login details so we can deploy SEO changes.",
        businessName: "Business name",
        businessNamePh: "Saudia Marketing",
        ownerUserId: "Owner User ID",
        ownerUserIdPh: "6a451c72711bf69f27e57cd5",
        websiteUrl: "Website URL",
        websiteUrlPh: "https://www.saudiamarketing.sa",
        businessAddress: "Business Address",
        businessAddressPh: "King Fahd Road, Al Olaya, Riyadh, Saudi Arabia",
        companyLogo: "Company Logo",
        companyLogoHint: "JPG, PNG, WEBP, Or GIF. Max 5 MB.",
        pocContactNumber: "Contact Number",
        pocContactNumberPh: "+966 55 123 4567",
        pocEmail: "Contact Email",
        sectionServiceTitle: "Service Information",
        sectionServiceLead: "Add Services And Customer Profile Details.",
        servicesOffered: "Services Offered",
        servicesOfferedPh: "SEO, Content Marketing, Google Ads",
        primaryServiceToPromote: "Primary Service To Promote",
        primaryServiceToPromotePh: "Google Maps SEO",
        idealCustomerProfile: "Ideal Customer Profile",
        idealCustomerProfilePh: "SMEs In Riyadh And Jeddah",
        sectionOperationsTitle: "Operations",
        sectionOperationsLead: "Add Locations And Optional Business Hours.",
        opensAt: "Business Opens At",
        closesAt: "Business Closes At",
        valTime: "Use 24-Hour Time (HH:mm).",
        sectionMarketingTitle: "Marketing Access",
        sectionMarketingLead: "Mark Which Channel Access Has Been Shared.",
        websiteLogin: "Website Login",
        websiteLoginPh: "https://portal.saudiamarketing.sa",
        websiteHosting: "Website Hosting",
        websiteHostingPh: "AWS Riyadh Region Account",
        googleAnalytics: "Google Analytics",
        googleAnalyticsPh: "https://analytics.google.com/",
        googleSearchConsole: "Google Search Console",
        googleSearchConsolePh: "https://search.google.com/search-console",
        googleBusinessProfile: "Google Business Profile",
        googleBusinessProfilePh: "https://business.google.com/",
        websiteLoginShared: "Website Login Shared",
        websiteLoginSharedDesc: "The Client Has Shared Website Login Access.",
        websiteHostingShared: "Website Hosting Shared",
        websiteHostingSharedDesc: "The Client Has Shared Website Hosting Access.",
        googleAnalyticsShared: "Google Analytics Shared",
        googleAnalyticsSharedDesc: "The Client Has Shared Google Analytics Access.",
        googleSearchConsoleShared: "Google Search Console Shared",
        googleSearchConsoleSharedDesc: "The Client Has Shared Google Search Console Access.",
        googleBusinessProfileShared: "Google Business Profile Shared",
        googleBusinessProfileSharedDesc: "The Client Has Shared Google Business Profile Access.",
        sectionCompetitorsTitle: "Competitors",
        sectionCompetitorsLead: "Add Competitor URLs As A Comma Separated List.",
        competitorUrls: "Competitor URLs",
        competitorUrlsPh: "https://competitor-riyadh.sa, https://competitor-jeddah.sa",
        industryNiche: "Industry niche",
        industryNichePh: "Select an industry",
        industryNicheLoading: "Loading industries…",
        industryNicheLoadError: "Could not load industries. Try again later.",
        targetLocations: "Target locations",
        targetLocationsPh: "Riyadh, Jeddah, Dammam",
        targetLocationsHelp: "Press Enter or comma to add. Backspace removes the last tag.",
        isB2b: "B2B",
        isB2bDesc: "Sells to other businesses.",
        isB2c: "B2C",
        isB2cDesc: "Sells directly to consumers.",
        briefDescription: "Brief description",
        briefDescriptionPh: "A short summary of the business and what it offers.",
        briefDescriptionHelp: "Optional — a couple of sentences is enough.",
        seoGoals: "Select SEO goals",
        seoGoalsHelp: "Pick all that apply.",
        seoGoalsLoading: "Loading SEO goals…",
        seoGoalsLoadError: "Could not load SEO goals. Try again later.",
        seoGoalsEmpty: "No SEO goals available.",
        hasGoogleAnalytics: "Google Analytics",
        hasGoogleAnalyticsDesc: "GA4 property is configured.",
        hasGoogleSearchConsole: "Google Search Console",
        hasGoogleSearchConsoleDesc: "Search Console property is verified.",
        hasGoogleTagManager: "Google Tag Manager",
        hasGoogleTagManagerDesc: "GTM container is installed.",
        hasGoogleAds: "Google Ads",
        hasGoogleAdsDesc: "Google Ads account is active.",
        googleConnect: "Connect",
        googleConnectError: "Could not connect. Try again.",
        hasWebsiteLoginDetails: "Website login details available",
        hasWebsiteLoginDetailsDesc: "We have credentials to log into the CMS.",
        cmsLoginPageUrl: "CMS login URL",
        cmsLoginPageUrlPh: "https://acme.example.com/wp-login.php",
        cmsUsername: "CMS username",
        cmsUsernamePh: "admin",
        cmsPassword: "CMS password",
        cmsPasswordPh: "••••••••",
        cmsPasswordEditPh: "Leave blank to keep current",
        cmsPasswordEditHelp: "Only enter a value if you want to change the saved password.",
        submit: "Create project",
        submitting: "Creating…",
        editSubmit: "Save changes",
        editSubmitting: "Saving…",
        successTitle: "Project saved",
        successFallback: "The project was created.",
        editSuccessTitle: "Project updated",
        editSuccessFallback: "The project was updated.",
        errorTitle: "Could not create project",
        errorFallback: "Something went wrong. Try again.",
        editErrorTitle: "Could not update project",
        editErrorFallback: "Something went wrong. Try again.",
        missingProjectAccess:
          "You are not a member of any project yet. Complete onboarding or ask a project owner to invite you.",
        nextStep: "Next Step",
        previousStep: "Back",
        stepValidationError: "Fix Required Fields Before Moving To The Next Step.",
        valRequired: "This field is required.",
        valMin: "Use at least 2 characters.",
        valUrl: "Enter a valid URL (https://…).",
        valTargetLocations: "Add at least one location.",
        valSeoGoals: "Select at least one SEO goal.",
        backToList: "Back to projects",
        remove: "Remove",
      },
      table: {
        toolbarHint: "Projects in your workspace.",
        colId: "ID",
        colBusinessName: "Business name",
        colWebsite: "Website",
        colBusinessType: "Business type",
        colActions: "Actions",
        createProject: "Create Project",
        noBusinessType: "No business type",
        businessTypeB2b: "B2B",
        businessTypeB2c: "B2C",
        rowsSelected: "{{selected}} of {{total}} row(s) selected",
        rowsPerPage: "Rows per page",
        pageOf: "Page {{page}} of {{count}}",
        firstPage: "First page",
        previousPage: "Previous page",
        nextPage: "Next page",
        lastPage: "Last page",
        updating: "Refreshing…",
        loadErrorTitle: "Could not load projects",
        loadErrorBody: "Check your connection and try again.",
        edit: "Edit",
        delete: "Delete",
        more: "More actions",
        moreView: "View details",
        deleteConfirmTitle: "Delete this project?",
        deleteConfirmDescription: "This will remove “{{name}}”. This action cannot be undone.",
        deleteConfirmCancel: "Cancel",
        deleteConfirmAction: "Delete project",
        deleteInProgress: "Deleting…",
        deleteSuccessTitle: "Project deleted",
        deleteSuccessFallback: "The project was removed.",
        deleteErrorTitle: "Could not delete project",
        dismiss: "Dismiss",
        detailSheetLead: "Full project details from the current page.",
        accessDeniedTitle: "No access",
        accessDeniedBody: "You don't have permission to view projects. Ask an administrator if you need access.",
        yes: "Yes",
        no: "No",
        colIsB2b: "B2B",
        colIsB2c: "B2C",
        colIndustryNiche: "Industry niche",
        colIndustryOther: "Industry (other)",
        colTargetLocations: "Target locations",
        colBriefDescription: "Brief description",
        colMainCompetitors: "Main competitors",
        colSeoGoals: "SEO goals",
        colSeoGoalOther: "SEO goal (other)",
        colGoogleAnalytics: "Google Analytics",
        colGoogleSearchConsole: "Google Search Console",
        colGoogleTagManager: "Google Tag Manager",
        colGoogleAds: "Google Ads",
        colWebsiteLoginDetails: "Website login details",
        colCmsLoginUrl: "CMS login URL",
        colCmsUsername: "CMS username",
        colCmsPasswordSet: "CMS password set",
        colCreatedAt: "Created",
        colUpdatedAt: "Updated",
      },
    },
    analytics: {
      title: "Analytics",
    },
    seoActivities: {
      title: "SEO Activities",
    },
    leads: {
      title: "Leads",
    },
    reports: {
      title: "Reports",
    },
    roles: {
      title: "Roles & Permissions",
      subtitle: "Manage Role Templates And Their Permission Sets.",
      createRoleTitle: "Create role",
      editRoleTitle: "Edit role",
      createForm: {
        title: "New role",
        lead: "Give the role a name and select the permissions it should grant.",
        editTitle: "Edit role",
        editLead: "Update the role name and permissions, then save your changes.",
        editSubmit: "Save changes",
        editSubmitting: "Saving…",
        editSuccessTitle: "Role updated",
        editSuccessFallback: "The role was updated.",
        editErrorTitle: "Could not update role",
        editErrorFallback: "Something went wrong. Try again.",
        name: "Role name",
        namePh: "content_manager",
        permsHeading: "Select permissions",
        permsSelectAll: "Select all",
        permsCount: "{{selected}} of {{total}} selected",
        permsLoading: "Loading permissions…",
        permsEmpty: "No permissions available.",
        permsLoadErrorTitle: "Could not load permissions",
        permsLoadErrorBody: "Check your connection and try again.",
        submit: "Create role",
        submitting: "Creating…",
        successTitle: "Role created",
        successFallback: "The role was saved.",
        errorTitle: "Could not create role",
        errorFallback: "Something went wrong. Try again.",
        valRequired: "This field is required.",
        valMin: "Use at least 2 characters.",
        backToList: "Back to roles",
      },
      table: {
        searchPlaceholder: "Search Roles...",
        sortLabel: "Sort",
        sortToggle: "Sort By {{direction}}",
        sortNewest: "Newest",
        sortOldest: "Oldest",
        colRole: "Role",
        colScope: "Scope",
        colPermissions: "Permissions",
        colMembers: "Members",
        colSystem: "System",
        colActions: "Actions",
        scopePlatform: "Platform",
        scopeProject: "Project",
        permissionsCount: "{{count}} Permissions",
        systemYes: "System",
        systemNo: "Custom",
        showingRoles: "Showing {{from}} To {{to}} Of {{total}} Roles",
        pageNumber: "Page {{page}}",
        loading: "Loading Roles...",
        emptyTitle: "No Roles Found",
        emptyBody: "Try Another Search Or Clear Filters To View All Roles.",
        viewRole: "View {{name}}",
        editRole: "Edit {{name}}",
        createRole: "Add Role",
        previousPage: "Previous Page",
        nextPage: "Next Page",
        updating: "Updating…",
        loadErrorTitle: "Could Not Load Roles",
        loadErrorBody: "Check Your Connection And Try Again.",
        accessDeniedTitle: "No Access",
        accessDeniedBody: "You Don't Have Permission To View Roles. Ask An Administrator If You Need Access.",
      },
    },
  },
  auth: {
    signIn: {
      title: "Welcome Back",
      subtitle: "Log in to your workspace. Your SEO dashboard is ready.",
      email: "Email",
      password: "Password",
      submit: "Log In",
      forgotPassword: "Forgot Password?",
      heroTitleStart: "SEO Clarity For",
      heroTitleAccent: "Every Client",
      heroLead: "Track rankings, spot opportunities, and keep stakeholders aligned from one calm workspace.",
      heroPoint1: "Multi-client dashboards without the spreadsheet chaos",
      heroPoint2: "Scheduled checks and history you can trust",
      heroPoint3: "Built for teams who care about accuracy",
      continueWith: "Continue With",
      continueGoogle: "Google",
      continueSso: "SSO",
      emailInvalid: "Enter a valid email address.",
      passwordMin: "Use at least 6 characters.",
      fieldRequired: "This field is required.",
      loginSuccess: "Signed in successfully.",
      loginErrorUnexpected: "Something went wrong. Please try again.",
      emailVerifiedSuccess: "Your email address has been verified. You can sign in now.",
      registrationSuccess:
        "Account created. Check your email for a verification link, then sign in to continue.",
      noAccountPrompt: "New here?",
      registerCta: "Start Your Journey",
    },
    forgotPassword: {
      title: "Forgot password",
      subtitle: "Enter your account email and we'll send reset instructions if the address is registered.",
      email: "Email",
      submit: "Send reset link",
      backToSignIn: "Back to sign in",
      emailInvalid: "Enter a valid email address.",
      fieldRequired: "This field is required.",
      submitSuccess: "If that email is in our system, you'll receive reset instructions shortly.",
      submitErrorFallback: "Could not send the reset link. Try again.",
    },
    resetPassword: {
      title: "Reset password",
      subtitle: "Choose a new password for your account. This link can only be used once.",
      password: "New password",
      confirmPassword: "Confirm password",
      submit: "Reset password",
      backToSignIn: "Back to sign in",
      fieldRequired: "This field is required.",
      passwordMin: "Use at least 8 characters.",
      passwordMismatch: "Passwords do not match.",
      submitSuccess: "Your password has been updated. You can sign in with your new password.",
      submitErrorFallback: "Could not reset your password. Try again or request a new link.",
      invalidLinkTitle: "Invalid reset link",
      invalidLinkBody: "This link is missing required information. Request a new reset email from the sign-in page.",
    },
    register: {
      title: "Create An Account",
      subtitle: "Create an account to get started with Rank Radar",
      fullName: "Full name",
      fullNamePh: "Jane Doe",
      fullNameMin: "Enter at least 2 characters.",
      email: "Email",
      password: "Password",
      confirmPassword: "Confirm password",
      passwordMin: "Use at least 8 characters.",
      passwordMismatch: "Passwords do not match.",
      submit: "Create Account",
      hasAccount: "Already have an account?",
      signInLink: "Log In",
      fieldRequired: "This field is required.",
      emailInvalid: "Enter a valid email address.",
      submitSuccess: "Account created. Check your email for a verification link, then sign in.",
      submitErrorFallback: "Could not complete registration. Please try again.",
    },
    verification: {
      title: "Verify your email address",
      description:
        "Before you continue, confirm your email using the link we sent. If you did not receive it, you can request another.",
      resendCta: "Resend verification email",
      resendSuccess: "A new verification link has been sent to your email address.",
      resendErrorFallback: "Could not send the verification email. Try again.",
    },
  },
  lang: {
    en: "English",
    ar: "العربية",
    aria: "Interface language",
    switchToArabic: "Switch interface to Arabic",
    switchToEnglish: "Switch interface to English",
  },
  theme: {
    switchToLight: "Switch to light theme",
    switchToDark: "Switch to dark theme",
  },
};

export default translation;
