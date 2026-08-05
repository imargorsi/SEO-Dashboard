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
    selectPrompt: string;
  };
  nav: {
    aria: string;
    openMenu: string;
    closeMenu: string;
    collapseSidebar: string;
    expandSidebar: string;
    groupGeneral: string;
    groupReporting: string;
    groupSettings: string;
    dashboard: string;
    users: string;
    rolesPermissions: string;
    projects: string;
    analytics: string;
    seoActivities: string;
    leads: string;
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
  ui: {
    close: string;
    error: {
      title: string;
      description: string;
      tryAgain: string;
      goHome: string;
    };
  };
  form: {
    showPassword: string;
    hidePassword: string;
    pickImage: string;
    changeImage: string;
    fileTooLarge: string;
    searchCountry: string;
    noCountriesFound: string;
    removeChip: string;
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
    emptyTitle: string;
    emptyBody: string;
    categoriesHeading: string;
    categories: {
      theme: string;
      integrations: string;
    };
    themePacks: {
      sectionTitle: string;
      lead: string;
      selected: string;
      saveErrorFallback: string;
      default: string;
      defaultDescription: string;
      "glass-aurora": string;
      "glass-auroraDescription": string;
      "carbon-ice": string;
      "carbon-iceDescription": string;
      "lumen-slate": string;
      "lumen-slateDescription": string;
    };
    fontPacks: {
      sectionTitle: string;
      lead: string;
      selected: string;
      saveErrorFallback: string;
      jakarta: string;
      jakartaDescription: string;
      ubuntu: string;
      ubuntuDescription: string;
      nunito: string;
      nunitoDescription: string;
      inter: string;
      interDescription: string;
    };
    integrations: {
      lead: string;
      projectContext: string;
      selectProjectTitle: string;
      selectProjectBody: string;
      refresh: string;
      connect: string;
      update: string;
      disconnect: string;
      propertyLabel: string;
      propertyPlaceholder: string;
      propertyRequired: string;
      gscPropertyPlaceholder: string;
      ga4PropertyPlaceholder: string;
      lastSynced: string;
      connectSuccess: string;
      connectError: string;
      updateSuccess: string;
      updateError: string;
      disconnectSuccess: string;
      disconnectError: string;
      syncSuccess: string;
      syncError: string;
      refreshSuccess: string;
      refreshError: string;
      confirmCancel: string;
      confirmConnectTitle: string;
      confirmConnectBody: string;
      confirmConnect: string;
      confirmUpdateTitle: string;
      confirmUpdateBody: string;
      confirmUpdate: string;
      confirmDisconnectTitle: string;
      confirmDisconnectBody: string;
      confirmDisconnect: string;
      confirmRefreshTitle: string;
      confirmRefreshBody: string;
      confirmRefresh: string;
      services: {
        gsc: string;
        ga4: string;
      };
      serviceLead: {
        gsc: string;
        ga4: string;
      };
      status: {
        connected: string;
        disconnected: string;
        error: string;
      };
    };
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
      createLead: string;
      editUserTitle: string;
      editLead: string;
      createForm: {
        profileImage: string;
        profileImageHint: string;
        profileImageUploadLabel: string;
        profileImageChangeLabel: string;
        name: string;
        namePh: string;
        email: string;
        emailPh: string;
        password: string;
        passwordPh: string;
        passwordPhEdit: string;
        passwordConfirmation: string;
        passwordConfirmationPh: string;
        passwordConfirmationPhEdit: string;
        submit: string;
        submitting: string;
        editSubmit: string;
        editSubmitting: string;
        backToList: string;
        valRequired: string;
        valEmail: string;
        valMinPassword: string;
        valPasswordMatch: string;
        successFallback: string;
        errorFallback: string;
        editSuccessFallback: string;
        editErrorFallback: string;
        membershipAssignError: string;
      };
      memberships: {
        title: string;
        lead: string;
        count: string;
        empty: string;
        projectLabel: string;
        projectPh: string;
        roleLabel: string;
        rolePh: string;
        add: string;
        addTitle: string;
        addLead: string;
        save: string;
        saving: string;
        removeAria: string;
        statusInvited: string;
        assignSuccess: string;
        assignError: string;
        updateSuccess: string;
        updateError: string;
        removeSuccess: string;
        removeError: string;
        confirmUpdateTitle: string;
        confirmUpdateBody: string;
        confirmUpdate: string;
        confirmRemoveTitle: string;
        confirmRemoveBody: string;
        confirmRemove: string;
        confirmCancel: string;
      };
      assignments: {
        noProjects: string;
        membershipOwner: string;
        membershipMember: string;
        membershipInvited: string;
        projectStatus: {
          pending: string;
          active: string;
          inactive: string;
          rejected: string;
        };
      };
      detail: {
        title: string;
        lead: string;
        accountTitle: string;
        accountLead: string;
        email: string;
        createdAt: string;
        updatedAt: string;
        emailVerifiedAt: string;
        emailNotVerified: string;
        projectsTitle: string;
        projectsLead: string;
      };
      statusFilter: {
        ariaLabel: string;
        all: string;
        active: string;
        inactive: string;
      };
      table: {
        searchPlaceholder: string;
        sortLabel: string;
        sortBy: string;
        sortToggle: string;
        sortNewest: string;
        sortOldest: string;
        sortByNewest: string;
        sortByOldest: string;
        colUser: string;
        colProjects: string;
        colStatus: string;
        colLastAction: string;
        colActions: string;
        statusActive: string;
        statusInactive: string;
        projectsCount_one: string;
        projectsCount_other: string;
        projectsLabel_one: string;
        projectsLabel_other: string;
        lastActionVerified: string;
        lastActionCreated: string;
        showingUsers: string;
        pageNumber: string;
        loading: string;
        emptyTitle: string;
        emptyBody: string;
        viewUser: string;
        editUser: string;
        activateUser: string;
        deactivateUser: string;
        activateSuccess: string;
        deactivateSuccess: string;
        statusActionError: string;
        deleteUser: string;
        deleteTitle: string;
        deleteBody: string;
        deleteCancel: string;
        deleteConfirm: string;
        deleteSuccess: string;
        deleteErrorFallback: string;
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
      viewMode: {
        ariaLabel: string;
        cards: string;
        table: string;
      };
      cardActions: {
        approve: string;
        decline: string;
        active: string;
        inactive: string;
        pending: string;
        viewDetails: string;
        editProject: string;
        inviteUsers: string;
        deleteProject: string;
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
      seoGoalDescriptions: {
        grow_brand_awareness: string;
        outrank_competitors: string;
        get_more_calls: string;
        increase_online_orders: string;
        improve_local_visibility: string;
      };
      seoGoalTooltips: {
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
        sidebarMembersTitle: string;
        memberOwnerBadge: string;
        memberUserBadge: string;
        memberOwnerFallback: string;
        noMembers: string;
        timelineTitle: string;
        timelineCreated: string;
        timelineApproved: string;
        timelineRejected: string;
        timelineUpdated: string;
        noValue: string;
        noServices: string;
        noLocations: string;
        noSeoGoals: string;
        noCompetitors: string;
      };
      invitations: {
        bannerAria: string;
        title: string;
        invitedBy: string;
        unknownInviter: string;
        accept: string;
        decline: string;
        acceptSuccess: string;
        acceptError: string;
        declineSuccess: string;
        declineError: string;
      };
      createLead: string;
      createForm: {
        title: string;
        lead: string;
        editTitle: string;
        editLead: string;
        sectionBusinessLead: string;
        sectionSeoLead: string;
        sectionGoogleTitle: string;
        sectionGoogleLead: string;
        sectionCmsTitle: string;
        sectionCmsLead: string;
        businessName: string;
        businessNamePh: string;
        ownerUserId: string;
        ownerUserPlaceholder: string;
        ownerUserLoadError: string;
        ownerUserEmpty: string;
        websiteUrl: string;
        websiteUrlPh: string;
        businessAddress: string;
        businessAddressPh: string;
        companyLogoHint: string;
        companyLogoUploadLabel: string;
        pocContactNumber: string;
        pocContactNumberPh: string;
        pocEmail: string;
        pocEmailPh: string;
        sectionServiceLead: string;
        servicesOffered: string;
        servicesOfferedPh: string;
        servicesOfferedHelp: string;
        primaryServiceToPromote: string;
        primaryServiceToPromotePh: string;
        primaryServiceEmpty: string;
        idealCustomerProfile: string;
        idealCustomerProfilePh: string;
        sectionOperationsLead: string;
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
        sectionCompetitorsLead: string;
        competitorUrls: string;
        competitorUrlsPh: string;
        competitorUrlsHelp: string;
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
        stepBasicInformation: string;
        stepServiceInformation: string;
        stepSeo: string;
        stepInviteUsers: string;
        sectionInviteUsersTitle: string;
        sectionInviteUsersLead: string;
        inviteSearchLabel: string;
        inviteSearchPlaceholder: string;
        inviteSearchEmpty: string;
        inviteSearchError: string;
        inviteSelectedLabel: string;
        inviteRemoveAria: string;
        inviteHelp: string;
        inviteHelpCreate: string;
        inviteHelpEdit: string;
        inviteLoading: string;
        inviteForbidden: string;
        inviteSuccess: string;
        inviteError: string;
        inviteRemoved: string;
        inviteRemoveError: string;
        inviteBatchSuccess: string;
        inviteBatchPartialError: string;
        stepValidationError: string;
        valRequired: string;
        valMin: string;
        valUrl: string;
        valTargetLocations: string;
        valSeoGoals: string;
        backToList: string;
        backToProject: string;
        editForbiddenTitle: string;
        editForbiddenBody: string;
        editNotAllowedTitle: string;
        editNotAllowedBody: string;
        remove: string;
      };
      inviteModal: {
        title: string;
        lead: string;
        leadWithProject: string;
        close: string;
        done: string;
        save: string;
        saving: string;
        loading: string;
        loadError: string;
        help: string;
        forbidden: string;
        inviteRemoved: string;
        inviteRemoveError: string;
        inviteError: string;
        inviteBatchSuccess: string;
        inviteBatchPartialError: string;
      };
      table: {
        toolbarHint: string;
        colId: string;
        colBusinessName: string;
        colWebsite: string;
        colStatus: string;
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
      subtitle: string;
      selectProjectTitle: string;
      selectProjectBody: string;
      noAccessTitle: string;
      noAccessBody: string;
      loadError: string;
      dateFrom: string;
      dateTo: string;
      export: {
        excel: string;
        exporting: string;
        success: string;
        empty: string;
        errorFallback: string;
        metric: string;
        value: string;
        date: string;
        channel: string;
        country: string;
        sheets: {
          summary: string;
          dailyTrend: string;
          topQueries: string;
          topPages: string;
          trafficSources: string;
          countries: string;
        };
      };
      dateFilter: {
        ariaLabel: string;
        presetsHeading: string;
        presets: {
          last_15_days: string;
          last_30_days: string;
          last_90_days: string;
          last_month: string;
          this_month: string;
        };
        months: string[];
        weekdays: { sun: string; mon: string; tue: string; wed: string; thu: string; fri: string; sat: string };
        separator: string;
        fromPlaceholder: string;
        toPlaceholder: string;
        reset: string;
        cancel: string;
        apply: string;
        previousMonth: string;
        nextMonth: string;
      };
      summary: {
        clicks: string;
        impressions: string;
        ctr: string;
        position: string;
        sessions: string;
        organicSessions: string;
      };
      topQueries: {
        title: string;
        viewAll: string;
        loading: string;
        emptyTitle: string;
        emptyBody: string;
        modalTitle: string;
        modalSubtitle: string;
        modalClose: string;
        modalRowCount: string;
        columns: {
          dimension: string;
          clicks: string;
          impressions: string;
          ctr: string;
          position: string;
        };
      };
      topPages: {
        title: string;
        viewAll: string;
        loading: string;
        emptyTitle: string;
        emptyBody: string;
        modalTitle: string;
        modalSubtitle: string;
        modalClose: string;
        modalRowCount: string;
        columns: {
          dimension: string;
          clicks: string;
          impressions: string;
          ctr: string;
          position: string;
        };
      };
      trafficSources: {
        title: string;
        totalLabel: string;
        legendAria: string;
        loading: string;
        emptyTitle: string;
        emptyBody: string;
      };
      demographics: {
        title: string;
        subtitle: string;
        metricHint: string;
        listAria: string;
        mapAria: string;
        mapUnavailable: string;
        loading: string;
        emptyTitle: string;
        emptyBody: string;
      };
      trendChart: {
        title: string;
        subtitle: string;
        tabsAria: string;
        tabs: {
          clicks: string;
          impressions: string;
          ctr: string;
          position: string;
        };
        changeIncrease: string;
        changeDecrease: string;
        changeFlat: string;
        emptyTitle: string;
        emptyBody: string;
      };
      tables: {
        topQueries: string;
        topPages: string;
        geoTraffic: string;
        dimension: string;
        clicks: string;
        impressions: string;
        ctr: string;
        position: string;
        sessions: string;
        users: string;
        loading: string;
        emptyTitle: string;
        emptyBody: string;
      };
    };
    seoActivities: {
      title: string;
      subtitle: string;
      typeFilter: {
        ariaLabel: string;
        blogs: string;
        backlinks: string;
        technical_work: string;
      };
      summary: {
        cards: {
          blogs: string;
          backlinks: string;
          technical_work: string;
          total: string;
        };
      };
      dateFilter: {
        ariaLabel: string;
        presetsHeading: string;
        presets: {
          all: string;
          last_15_days: string;
          last_30_days: string;
          last_month: string;
          this_month: string;
          last_year: string;
          this_year: string;
        };
        months: [
          string,
          string,
          string,
          string,
          string,
          string,
          string,
          string,
          string,
          string,
          string,
          string,
        ];
        weekdays: {
          sun: string;
          mon: string;
          tue: string;
          wed: string;
          thu: string;
          fri: string;
          sat: string;
        };
        fromPlaceholder: string;
        toPlaceholder: string;
        separator: string;
        previousMonth: string;
        nextMonth: string;
        reset: string;
        cancel: string;
        apply: string;
      };
      table: {
        emptyTitle: string;
        emptyBody: string;
        summary: string;
        previousPage: string;
        nextPage: string;
        pageNumber: string;
        colDate: string;
        colBlogDetails: string;
        colBacklinkDetails: string;
        colChangeDetails: string;
        colBlogLink: string;
        colUrls: string;
        colPageLink: string;
        colActions: string;
        editActivity: string;
        deleteActivity: string;
        deleteTitle: string;
        deleteBody: string;
        deleteCancel: string;
        deleteConfirm: string;
        deleteSuccess: string;
        deleteErrorFallback: string;
        loadErrorBody: string;
      };
      selectProjectTitle: string;
      selectProjectBody: string;
      export: {
        excel: string;
        success: string;
        empty: string;
        errorFallback: string;
      };
      quickAdd: {
        trigger: string;
        title: string;
        lead: string;
        editTitle: string;
        editLead: string;
        close: string;
        tabsAriaLabel: string;
        tabs: {
          blogs: string;
          backlinks: string;
          technical_work: string;
        };
        fields: {
          title: string;
          titlePh: string;
          anchorText: string;
          anchorTextPh: string;
          details: string;
          detailsPh: string;
          url: string;
          urlPh: string;
          occurredOn: string;
        };
        validation: {
          required: string;
          url: string;
          date: string;
          minTitle: string;
          minAnchor: string;
          minDetails: string;
        };
        cancel: string;
        submit: string;
        save: string;
        success: {
          blogs: string;
          backlinks: string;
          technical_work: string;
        };
        updateSuccess: {
          blogs: string;
          backlinks: string;
          technical_work: string;
        };
        createErrorFallback: string;
        updateErrorFallback: string;
      };
    };
    leads: {
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
        description: string;
        descriptionPh: string;
        systemRoleNameLocked: string;
        permsHeading: string;
        permsLead: string;
        permsModulesHeading: string;
        permsModuleLead: string;
        permsSelectAll: string;
        permsClearAll: string;
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
      actions: {
        view: string;
        create: string;
        edit: string;
        delete: string;
        invite: string;
        remove: string;
        disconnect: string;
        refresh: string;
      };
      detail: {
        title: string;
        lead: string;
        loading: string;
        overviewTitle: string;
        overviewLead: string;
        description: string;
        noDescription: string;
        members: string;
        permissionsCount: string;
        createdAt: string;
        updatedAt: string;
        permissionsTitle: string;
        permissionsLead: string;
        noPermissions: string;
      };
      statusFilter: {
        ariaLabel: string;
        all: string;
        active: string;
        inactive: string;
      };
      table: {
        searchPlaceholder: string;
        sortLabel: string;
        sortBy: string;
        sortToggle: string;
        sortNewest: string;
        sortOldest: string;
        sortByNewest: string;
        sortByOldest: string;
        colRole: string;
        colPermissions: string;
        colMembers: string;
        colSystem: string;
        colStatus: string;
        colActions: string;
        scopePlatform: string;
        scopeProject: string;
        permissionsCount: string;
        systemYes: string;
        systemNo: string;
        statusActive: string;
        statusInactive: string;
        showingRoles: string;
        pageNumber: string;
        loading: string;
        emptyTitle: string;
        emptyBody: string;
        viewRole: string;
        editRole: string;
        activateRole: string;
        deactivateRole: string;
        activateSuccess: string;
        deactivateSuccess: string;
        statusActionError: string;
        deleteRole: string;
        deleteTitle: string;
        deleteBody: string;
        deleteCancel: string;
        deleteConfirm: string;
        deleteSuccess: string;
        deleteErrorFallback: string;
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
    appName: "Crawllex",
  },
  projectSelector: {
    triggerLabel: "Selected Project: {{name}}",
    listLabel: "Switch Project",
    listHeading: "Your Projects",
    cardLabel: "Project",
    emptyLabel: "No Projects Available",
    selectPrompt: "Select A Project To Continue",
  },
  nav: {
    aria: "Main Navigation",
    openMenu: "Open Menu",
    closeMenu: "Close Menu",
    collapseSidebar: "Collapse Sidebar",
    expandSidebar: "Expand Sidebar",
    groupGeneral: "General",
    groupReporting: "Reporting",
    groupSettings: "Settings",
    dashboard: "Dashboard",
    users: "Users",
    rolesPermissions: "Roles & Permissions",
    projects: "Projects",
    analytics: "Analytics",
    seoActivities: "SEO Activities",
    leads: "Leads",
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
  ui: {
    close: "Close",
    error: {
      title: "Something Went Wrong",
      description:
        "Our Team Has Been Notified About This Error And We Are Fixing It.",
      tryAgain: "Try Again",
      goHome: "Go To Home",
    },
  },
  form: {
    showPassword: "Show password",
    hidePassword: "Hide password",
    pickImage: "Upload Image",
    changeImage: "Change Image",
    fileTooLarge: "This File Is Larger Than {{max}} MB. Please Choose A Smaller File.",
    searchCountry: "Search Country…",
    noCountriesFound: "No Countries Found.",
    removeChip: "Remove {{value}}",
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
    subtitle: "Manage Workspace Preferences.",
    emptyTitle: "No Settings Available",
    emptyBody: "There Are No Settings Modules Available For Your Account Yet.",
    categoriesHeading: "Categories",
    categories: {
      theme: "Theme",
      integrations: "Integrations",
    },
    themePacks: {
      sectionTitle: "Color Theme",
      lead: "Choose A Color Theme. Your Selection Syncs To Your Account.",
      selected: "Selected",
      saveErrorFallback: "Could Not Save Theme Preference.",
      default: "Default",
      defaultDescription: "Orange And Purple Brand Palette For Everyday Use.",
      "glass-aurora": "Glass Aurora",
      "glass-auroraDescription":
        "Premium Glassmorphism Theme With Soft Aurora Accents For A Futuristic SaaS Experience.",
      "carbon-ice": "Carbon Ice",
      "carbon-iceDescription":
        "Cool Graphite Surfaces With Ice Cyan Accents For A Sharp Modern SaaS Look.",
      "lumen-slate": "Lumen Slate",
      "lumen-slateDescription":
        "Clean Slate Surfaces With Teal Clarity And Indigo Depth For A Premium Agency Workspace.",
    },
    fontPacks: {
      sectionTitle: "Font",
      lead: "Choose A Typeface For The Dashboard. Your Selection Syncs To Your Account.",
      selected: "Selected",
      saveErrorFallback: "Could Not Save Font Preference.",
      jakarta: "Plus Jakarta Sans",
      jakartaDescription: "Default Modern Sans — Clear And Friendly For Everyday Dashboard Use.",
      ubuntu: "Ubuntu",
      ubuntuDescription: "Humanist Sans With Warm Character For A Distinctive Product Voice.",
      nunito: "Nunito",
      nunitoDescription: "Rounded Soft Sans For A Friendly, Approachable Interface Feel.",
      inter: "Inter",
      interDescription: "Modern UI Sans Optimized For Dense Screens And Long Reading.",
    },
    integrations: {
      lead: "Link Search Console And GA4 Properties For The Selected Project. Only Platform Admins Can Manage These Connections.",
      projectContext: "Selected Project: {{name}}",
      selectProjectTitle: "Select A Project",
      selectProjectBody: "Choose A Project From The Sidebar Before Linking Google Properties.",
      refresh: "Refresh Data",
      connect: "Connect",
      update: "Update",
      disconnect: "Disconnect",
      propertyLabel: "Property",
      propertyPlaceholder: "Select A Property",
      propertyRequired: "Property ID Is Required.",
      gscPropertyPlaceholder: "https://example.com/",
      ga4PropertyPlaceholder: "properties/123456789",
      lastSynced: "Last Synced {{value}}",
      connectSuccess: "Integration Connected.",
      connectError: "Failed To Connect Integration.",
      updateSuccess: "Integration Updated.",
      updateError: "Failed To Update Integration.",
      disconnectSuccess: "Integration Disconnected.",
      disconnectError: "Failed To Disconnect Integration.",
      syncSuccess: "Analytics Sync Completed.",
      syncError: "Failed To Sync Analytics.",
      refreshSuccess: "Analytics Sync Completed.",
      refreshError: "Failed To Sync Analytics.",
      confirmCancel: "Cancel",
      confirmConnectTitle: "Connect Property?",
      confirmConnectBody: "Link This {{service}} Property To The Selected Project And Start Syncing Cached Analytics.",
      confirmConnect: "Connect Property",
      confirmUpdateTitle: "Update Property?",
      confirmUpdateBody: "Replace The Linked {{service}} Property For This Project. Cached Analytics For The Previous Property Will Be Cleared And A Fresh Backfill Will Start.",
      confirmUpdate: "Update Property",
      confirmDisconnectTitle: "Disconnect Property?",
      confirmDisconnectBody: "Remove The {{service}} Link For This Project And Clear Cached Analytics For That Source.",
      confirmDisconnect: "Disconnect",
      confirmRefreshTitle: "Refresh Analytics Data?",
      confirmRefreshBody: "Pull The Latest Search Console And GA4 Metrics For This Project. Manual Refresh Is Limited To Once Per Hour.",
      confirmRefresh: "Refresh Data",
      services: {
        gsc: "Search Console",
        ga4: "Google Analytics 4",
      },
      serviceLead: {
        gsc: "Connect The Search Console Property Used For Organic Search Performance.",
        ga4: "Connect The GA4 Property Used For Sessions And Traffic Breakdowns.",
      },
      status: {
        connected: "Connected",
        disconnected: "Disconnected",
        error: "Error",
      },
    },
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
      createLead:
        "Add A New User Account With Name, Email, And Password. Assign Project Roles When Inviting Them To A Project.",
      editUserTitle: "Edit User",
      editLead: "Update This User's Name, Email, Password, Or Profile Image.",
      createForm: {
        profileImage: "Profile Image",
        profileImageHint: "JPEG, PNG, WebP, Or GIF. Optional.",
        profileImageUploadLabel: "Upload User Image",
        profileImageChangeLabel: "Change User Image",
        name: "Full Name",
        namePh: "Enter Full Name",
        email: "Email Address",
        emailPh: "Enter Email Address",
        password: "Password",
        passwordPh: "At Least 8 Characters",
        passwordPhEdit: "Leave Blank To Keep Current Password",
        passwordConfirmation: "Confirm Password",
        passwordConfirmationPh: "Re-Enter Password",
        passwordConfirmationPhEdit: "Re-Enter New Password",
        submit: "Create User",
        submitting: "Creating…",
        editSubmit: "Save Changes",
        editSubmitting: "Saving…",
        backToList: "Back To Users",
        valRequired: "This Field Is Required.",
        valEmail: "Enter A Valid Email Address.",
        valMinPassword: "Use At Least 8 Characters.",
        valPasswordMatch: "Passwords Do Not Match.",
        successFallback: "User Created Successfully.",
        errorFallback: "Could Not Create User. Try Again.",
        editSuccessFallback: "User Updated Successfully.",
        editErrorFallback: "Could Not Update User. Try Again.",
        membershipAssignError: "User Created, But Project Assignment Failed. Finish Assignments On The Edit Page.",
      },
      memberships: {
        title: "Project Assignments",
        lead: "Assign This User To Projects With A Project Role. Role Changes On Edit Save Immediately.",
        count: "{{count}} Assigned",
        empty: "No Projects Assigned Yet.",
        projectLabel: "Project",
        projectPh: "Select Project",
        roleLabel: "Role",
        rolePh: "Select Role",
        add: "Add",
        addTitle: "Add Project Assignment",
        addLead: "Choose A Project And Role For This User.",
        save: "Save",
        saving: "Saving",
        removeAria: "Remove {{name}}",
        statusInvited: "Invite Pending",
        assignSuccess: "Project Assignment Saved.",
        assignError: "Could Not Save Project Assignment.",
        updateSuccess: "Project Role Updated.",
        updateError: "Could Not Update Project Role.",
        removeSuccess: "Project Assignment Removed.",
        removeError: "Could Not Remove Project Assignment.",
        confirmUpdateTitle: "Update Project Role?",
        confirmUpdateBody: "Change The Role On {{name}} To {{role}}.",
        confirmUpdate: "Update Role",
        confirmRemoveTitle: "Remove Project Assignment?",
        confirmRemoveBody: "Remove This User From {{name}}. They Will Lose Project Access.",
        confirmRemove: "Remove Assignment",
        confirmCancel: "Cancel",
      },
      assignments: {
        noProjects: "No Projects Assigned",
        membershipOwner: "Project Owner",
        membershipMember: "Project User",
        membershipInvited: "Invite Pending",
        projectStatus: {
          pending: "Pending",
          active: "Active",
          inactive: "Inactive",
          rejected: "Rejected",
        },
      },
      detail: {
        title: "User Details",
        lead: "Account Information And Project Memberships From The Current List.",
        accountTitle: "Account Information",
        accountLead: "Core Profile Fields For This User.",
        email: "Email",
        createdAt: "Created",
        updatedAt: "Last Updated",
        emailVerifiedAt: "Email Verified",
        emailNotVerified: "Not Verified",
        projectsTitle: "Assigned Projects",
        projectsLead: "Projects This User Owns Or Belongs To.",
      },
      statusFilter: {
        ariaLabel: "Filter Users By Status",
        all: "All Users",
        active: "Active",
        inactive: "Inactive",
      },
      table: {
        searchPlaceholder: "Search Users...",
        sortLabel: "Sort",
        sortBy: "Sort By",
        sortToggle: "Sort By {{direction}}",
        sortNewest: "Newest",
        sortOldest: "Oldest",
        sortByNewest: "Sort Users By Newest",
        sortByOldest: "Sort Users By Oldest",
        colUser: "User",
        colProjects: "Projects",
        colStatus: "Status",
        colLastAction: "Last Action",
        colActions: "Actions",
        statusActive: "Active",
        statusInactive: "Inactive",
        projectsCount_one: "{{count}} Project",
        projectsCount_other: "{{count}} Projects",
        projectsLabel_one: "Project",
        projectsLabel_other: "Projects",
        lastActionVerified: "Email Verified",
        lastActionCreated: "Account Created",
        showingUsers: "Showing {{from}} To {{to}} Of {{total}} Users",
        pageNumber: "Page {{page}}",
        loading: "Loading Users...",
        emptyTitle: "No Users Found",
        emptyBody: "Try Another Search Or Clear Filters To View All Users.",
        viewUser: "View {{name}}",
        editUser: "Edit {{name}}",
        activateUser: "Activate {{name}}",
        deactivateUser: "Deactivate {{name}}",
        activateSuccess: "User Activated Successfully.",
        deactivateSuccess: "User Deactivated Successfully.",
        statusActionError: "Could Not Update User Status. Try Again.",
        deleteUser: "Delete {{name}}",
        deleteTitle: "Delete User?",
        deleteBody: "This User Will Be Permanently Removed.\nThis Action Cannot Be Undone.",
        deleteCancel: "Cancel",
        deleteConfirm: "Delete",
        deleteSuccess: "User Deleted Successfully.",
        deleteErrorFallback: "Could Not Delete User. Try Again.",
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
      viewMode: {
        ariaLabel: "Projects Layout",
        cards: "Cards View",
        table: "Table View",
      },
      cardActions: {
        approve: "Approve",
        decline: "Decline",
        active: "Activate",
        inactive: "Deactivate",
        pending: "Pending",
        viewDetails: "View Details",
        editProject: "Edit Project",
        inviteUsers: "Invite Users",
        deleteProject: "Delete Project",
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
        grow_brand_awareness: "Increase Brand Visibility",
        outrank_competitors: "Outperform Competitors",
        get_more_calls: "Generate More Leads",
        increase_online_orders: "Increase Online Sales",
        improve_local_visibility: "Strengthen Local Presence",
      },
      seoGoalDescriptions: {
        grow_brand_awareness: "Build Awareness And Improve Your Presence In Organic Search Results.",
        outrank_competitors: "Track Competitors, Identify Opportunities, And Gain A Competitive Edge.",
        get_more_calls: "Drive Qualified Enquiries, Calls, And Contact Form Submissions.",
        increase_online_orders: "Improve Organic Traffic That Converts Into Purchases And Revenue.",
        improve_local_visibility: "Improve Visibility In Local Search Results, Google Maps, And Nearby Searches.",
      },
      seoGoalTooltips: {
        grow_brand_awareness: "Grow Your Online Presence And Improve Brand Recognition Through Organic Search.",
        outrank_competitors: "Monitor Competitors' Rankings, Keywords, And Backlink Strategies.",
        get_more_calls: "Optimise Your Website To Attract Qualified Enquiries And Conversions.",
        increase_online_orders: "Improve Product Visibility And Drive More Revenue From Organic Traffic.",
        improve_local_visibility: "Boost Visibility In Local Search Results And Google Business Profile.",
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
        sectionCompetitorsLead: "Competitor Names Or Websites Provided For Benchmarking.",
        sidebarMembersTitle: "Project Members",
        memberOwnerBadge: "Project Owner",
        memberUserBadge: "Project User",
        memberOwnerFallback: "Project Owner",
        noMembers: "No Members",
        timelineTitle: "Timeline",
        timelineCreated: "Created",
        timelineApproved: "Approved",
        timelineRejected: "Rejected",
        timelineUpdated: "Last Updated",
        noValue: "Not Provided",
        noServices: "No Services Listed.",
        noLocations: "No Target Locations Listed.",
        noSeoGoals: "No SEO Goals Selected.",
        noCompetitors: "No Competitors Listed.",
      },
      invitations: {
        bannerAria: "Pending Project Invitations",
        title: "Invitation To {{projectName}}",
        invitedBy: "Invited By {{name}}",
        unknownInviter: "A Project Owner",
        accept: "Accept",
        decline: "Decline",
        acceptSuccess: "Invitation Accepted.",
        acceptError: "Could Not Accept Invitation.",
        declineSuccess: "Invitation Declined.",
        declineError: "Could Not Decline Invitation.",
      },
      createLead:
        "Set Up Your Business Profile To Start Tracking Your Website's SEO Performance, Rankings, And Growth Opportunities.",
      createForm: {
        title: "Project Details",
        lead: "Fill In The Business Basics, SEO Goals, And Access Information For This Project.",
        editTitle: "Edit Project",
        editLead: "Update The Project's Business Details, SEO Goals, And Access Information.",
        sectionBusinessLead:
          "Tell Us About Your Business So We Can Personalise Your Crawllex Workspace And Generate Accurate Insights.",
        sectionSeoLead:
          "Configure Your SEO Goals And Competitors To Personalise Your Dashboard, Reporting, And Optimisation Strategy.",
        sectionGoogleTitle: "Google Tools",
        sectionGoogleLead: "Which Google Products Are Connected For This Site?",
        sectionCmsTitle: "CMS Access",
        sectionCmsLead: "Optional Login Details So We Can Deploy SEO Changes.",
        businessName: "Business Name",
        businessNamePh: "E.g. Example Ltd",
        ownerUserId: "Project Owner",
        ownerUserPlaceholder: "Select A Project Owner",
        ownerUserLoadError: "Could Not Load Users. Try Again.",
        ownerUserEmpty: "No Verified Users Available To Assign.",
        websiteUrl: "Website URL",
        websiteUrlPh: "example.com",
        businessAddress: "Business Address",
        businessAddressPh: "Street Address, City, State/Province, Country",
        companyLogoHint: "Upload Your Brand Logo. JPG, PNG, WEBP, Or GIF (Maximum 5 MB).",
        companyLogoUploadLabel: "Upload Company Logo",
        pocContactNumber: "Contact Number",
        pocContactNumberPh: "5X XXX XXXX",
        pocEmail: "Business Email",
        pocEmailPh: "contact@example.com",
        sectionServiceLead:
          "Define Your Business Offerings And Target Audience To Receive Personalised SEO Recommendations And Market Insights.",
        servicesOffered: "Services / Products Offered",
        servicesOfferedPh: "E.g. SEO, Web Design, PPC Advertising, Content Marketing",
        servicesOfferedHelp: "Press Enter Or Comma To Add. Backspace Removes The Last Tag.",
        primaryServiceToPromote: "Primary Service / Product",
        primaryServiceToPromotePh: "Select A Primary Service / Product",
        primaryServiceEmpty: "Add Services Above First",
        idealCustomerProfile: "Ideal Customer",
        idealCustomerProfilePh: "E.g. Small And Medium-Sized Businesses Looking To Grow Their Online Presence",
        sectionOperationsLead:
          "Tell Us Where Your Business Operates So We Can Personalise Local Search Tracking And Location-Based SEO.",
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
        sectionCompetitorsLead:
          "Add The Names Or Websites Of Your Main Competitors So We Can Benchmark Your SEO Performance And Uncover Opportunities.",
        competitorUrls: "Competitor Names Or URLs",
        competitorUrlsPh: "Enter Your Competitor Names Or URLs: https://competitor1.com, Competitor 2, https://competitor3.com",
        competitorUrlsHelp: "Press Enter Or Comma To Add. Backspace Removes The Last Tag.",
        industryNiche: "Industry Niche",
        industryNichePh: "Select An Industry",
        industryNicheLoading: "Loading Industries…",
        industryNicheLoadError: "Could Not Load Industries. Try Again Later.",
        targetLocations: "Target Locations",
        targetLocationsPh: "E.g. Riyadh, Jeddah, Dammam, Saudi Arabia",
        targetLocationsHelp: "Press Enter Or Comma To Add. Backspace Removes The Last Tag.",
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
        submit: "Create Project",
        submitting: "Creating…",
        editSubmit: "Save Changes",
        editSubmitting: "Saving…",
        successTitle: "Project Saved",
        successFallback: "Project Created Successfully.",
        editSuccessTitle: "Project Updated",
        editSuccessFallback: "The Project Was Updated.",
        errorTitle: "Could Not Create Project",
        errorFallback: "Something Went Wrong. Try Again.",
        editErrorTitle: "Could Not Update Project",
        editErrorFallback: "Something Went Wrong. Try Again.",
        missingProjectAccess:
          "You are not a member of any project yet. Complete onboarding or ask a project owner to invite you.",
        nextStep: "Next Step",
        previousStep: "Back",
        stepBasicInformation: "Business Information",
        stepServiceInformation: "Business Details",
        stepSeo: "SEO Configuration",
        stepInviteUsers: "Invite Users",
        sectionInviteUsersTitle: "Invite Users",
        sectionInviteUsersLead:
          "Search Registered Users By Name Or Email And Invite Them As Project Users. They Must Accept Before Gaining Access.",
        inviteSearchLabel: "Search Users",
        inviteSearchPlaceholder: "Search By Name Or Email…",
        inviteSearchEmpty: "No Matching Users Found.",
        inviteSearchError: "Could Not Search Users. Try Again.",
        inviteSelectedLabel: "Selected Invitees",
        inviteRemoveAria: "Remove {{name}}",
        inviteHelp: "Only Registered, Verified Users Can Be Invited.",
        inviteHelpCreate:
          "Only Registered, Verified Users Can Be Invited. Invitations Are Sent After The Project Is Created.",
        inviteHelpEdit: "Only Registered, Verified Users Can Be Invited. Invitations Are Sent Immediately.",
        inviteLoading: "Loading Invited Users…",
        inviteForbidden: "You Do Not Have Permission To Invite Users.",
        inviteSuccess: "Invitation Sent.",
        inviteError: "Could Not Send Invitation.",
        inviteRemoved: "Invitation Removed.",
        inviteRemoveError: "Could Not Remove Invitation.",
        inviteBatchSuccess: "Invitations Were Sent.",
        inviteBatchPartialError: "{{count}} Invitation(s) Could Not Be Sent.",
        stepValidationError: "Fix Required Fields Before Moving To The Next Step.",
        valRequired: "This field is required.",
        valMin: "Use at least 2 characters.",
        valUrl: "Enter a valid website URL (e.g. example.com).",
        valTargetLocations: "Add at least one location.",
        valSeoGoals: "Select at least one SEO objective.",
        backToList: "Back to projects",
        backToProject: "Back To Project",
        editForbiddenTitle: "You Cannot Edit This Project",
        editForbiddenBody: "You Do Not Have Permission To Edit This Project.",
        editNotAllowedTitle: "Project Cannot Be Edited",
        editNotAllowedBody: "Rejected Projects Cannot Be Updated.",
        remove: "Remove",
      },
      inviteModal: {
        title: "Invite Users",
        lead: "Search Platform Users And Invite Them To This Project.",
        leadWithProject: "Invite Users To {{name}}.",
        close: "Close",
        done: "Done",
        save: "Send Invites",
        saving: "Sending…",
        loading: "Loading Project Members…",
        loadError: "Could Not Load Project Members.",
        help: "Only Registered, Verified Users Can Be Invited. Invitations Are Sent When You Save.",
        forbidden: "You Do Not Have Permission To Invite Users.",
        inviteRemoved: "Invitation Removed.",
        inviteRemoveError: "Could Not Remove Invitation.",
        inviteError: "Could Not Send Invitations.",
        inviteBatchSuccess: "Invitations Were Sent.",
        inviteBatchPartialError: "{{count}} Invitation(s) Could Not Be Sent.",
      },
      table: {
        toolbarHint: "Projects in your workspace.",
        colId: "ID",
        colBusinessName: "Business Name",
        colWebsite: "Website",
        colStatus: "Status",
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
        deleteConfirmTitle: "Delete This Project?",
        deleteConfirmDescription: "This Will Remove “{{name}}”.\nThis Action Cannot Be Undone.",
        deleteConfirmCancel: "Cancel",
        deleteConfirmAction: "Delete Project",
        deleteInProgress: "Deleting…",
        deleteSuccessTitle: "Project Deleted",
        deleteSuccessFallback: "The Project Was Removed.",
        deleteErrorTitle: "Could Not Delete Project",
        dismiss: "Dismiss",
        detailSheetLead: "Full project details from the current page.",
        accessDeniedTitle: "No Access",
        accessDeniedBody: "You Don't Have Permission To View Projects. Ask An Administrator If You Need Access.",
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
      subtitle: "Search Console And Analytics Performance For The Selected Project.",
      selectProjectTitle: "Select A Project",
      selectProjectBody: "Choose A Project From The Sidebar To View Analytics.",
      noAccessTitle: "Analytics Access Required",
      noAccessBody: "You Do Not Have Permission To View Analytics For This Project.",
      loadError: "Failed To Load Analytics.",
      dateFrom: "From",
      dateTo: "To",
      export: {
        excel: "Export Excel",
        exporting: "Exporting…",
        success: "Excel Report Downloaded.",
        empty: "No Analytics Data Matches The Current Filters.",
        errorFallback: "Could Not Export Analytics. Try Again.",
        metric: "Metric",
        value: "Value",
        date: "Date",
        channel: "Channel",
        country: "Country",
        sheets: {
          summary: "Summary",
          dailyTrend: "Daily Trend",
          topQueries: "Top Queries",
          topPages: "Top Pages",
          trafficSources: "Traffic Sources",
          countries: "Countries",
        },
      },
      dateFilter: {
        ariaLabel: "Analytics Date Range",
        presetsHeading: "Quick Ranges",
        presets: {
          last_15_days: "Last 15 Days",
          last_30_days: "Last 30 Days",
          this_month: "This Month",
          last_month: "Last Month",
          last_90_days: "Last 90 Days",
        },
        months: [
          "January", "February", "March", "April", "May", "June",
          "July", "August", "September", "October", "November", "December",
        ],
        weekdays: { sun: "Su", mon: "Mo", tue: "Tu", wed: "We", thu: "Th", fri: "Fr", sat: "Sa" },
        separator: "—",
        fromPlaceholder: "Start",
        toPlaceholder: "End",
        reset: "Reset",
        cancel: "Cancel",
        apply: "Apply",
        previousMonth: "Previous Month",
        nextMonth: "Next Month",
      },
      summary: {
        clicks: "Total Clicks",
        impressions: "Impressions",
        ctr: "Avg. CTR",
        position: "Avg. Position",
        sessions: "Sessions",
        organicSessions: "Organic Sessions",
      },
      topQueries: {
        title: "Top Search Queries",
        viewAll: "View All Queries",
        loading: "Loading…",
        emptyTitle: "No Search Queries",
        emptyBody: "Connect Search Console And Sync To Populate This Table.",
        modalTitle: "All Top Search Queries",
        modalSubtitle: "Full Ranking List For The Selected Date Range.",
        modalClose: "Close",
        modalRowCount: "{{count}} Queries",
        columns: {
          dimension: "Query",
          clicks: "Clicks",
          impressions: "Impressions",
          ctr: "CTR",
          position: "Position",
        },
      },
      topPages: {
        title: "Top Pages",
        viewAll: "View All Pages",
        loading: "Loading…",
        emptyTitle: "No Pages",
        emptyBody: "Connect Search Console And Sync To Populate This Table.",
        modalTitle: "All Top Pages",
        modalSubtitle: "Full Ranking List For The Selected Date Range.",
        modalClose: "Close",
        modalRowCount: "{{count}} Pages",
        columns: {
          dimension: "Page",
          clicks: "Clicks",
          impressions: "Impressions",
          ctr: "CTR",
          position: "Position",
        },
      },
      trafficSources: {
        title: "Traffic Sources",
        totalLabel: "Total",
        legendAria: "Traffic Source Breakdown",
        loading: "Loading…",
        emptyTitle: "No Traffic Sources",
        emptyBody: "Connect Google Analytics And Sync To Populate This Chart.",
      },
      demographics: {
        title: "User Demographics",
        subtitle: "Where Users Engage By Territory.",
        metricHint: "Total Users In The Selected Date Range.",
        listAria: "Top Countries By Users",
        mapAria: "World Map Of Users By Country",
        mapUnavailable: "Map Unavailable",
        loading: "Loading…",
        emptyTitle: "No Geographic Data",
        emptyBody: "Connect Google Analytics And Sync To Populate This Map.",
      },
      trendChart: {
        title: "SEO Performance Trend",
        subtitle: "Comparing Search Clicks And Organic Impressions Over Time.",
        tabsAria: "Performance Metric",
        tabs: {
          clicks: "Clicks",
          impressions: "Impressions",
          ctr: "CTR",
          position: "Position",
        },
        changeIncrease: "Increase",
        changeDecrease: "Decrease",
        changeFlat: "No Change",
        emptyTitle: "No Trend Data",
        emptyBody: "Connect Search Console And Sync To Populate This Chart.",
      },
      tables: {
        topQueries: "Top Queries",
        topPages: "Top Pages",
        geoTraffic: "Geographic Traffic",
        dimension: "Dimension",
        clicks: "Clicks",
        impressions: "Impressions",
        ctr: "CTR",
        position: "Position",
        sessions: "Sessions",
        users: "Users",
        loading: "Loading…",
        emptyTitle: "No Analytics Rows",
        emptyBody: "Connect Integrations And Sync To Populate This Table.",
      },
    },
    seoActivities: {
      title: "SEO Activities",
      subtitle: "Track Blogs, Backlinks, And Technical Work For The Selected Project.",
      typeFilter: {
        ariaLabel: "SEO Activity Type",
        blogs: "Blogs",
        backlinks: "Backlinks",
        technical_work: "Technical Work",
      },
      summary: {
        cards: {
          blogs: "Blogs Published",
          backlinks: "Backlinks Gained",
          technical_work: "Technical Work Issues Fixed",
          total: "All Activities Total",
        },
      },
      dateFilter: {
        ariaLabel: "Date Range Filter",
        presetsHeading: "Quick Ranges",
        presets: {
          all: "All Time",
          last_15_days: "Last 15 Days",
          last_30_days: "Last 30 Days",
          last_month: "Last Month",
          this_month: "This Month",
          last_year: "Last Year",
          this_year: "This Year",
        },
        months: [
          "January",
          "February",
          "March",
          "April",
          "May",
          "June",
          "July",
          "August",
          "September",
          "October",
          "November",
          "December",
        ],
        weekdays: {
          sun: "S",
          mon: "M",
          tue: "T",
          wed: "W",
          thu: "T",
          fri: "F",
          sat: "S",
        },
        fromPlaceholder: "From",
        toPlaceholder: "To",
        separator: "–",
        previousMonth: "Previous Month",
        nextMonth: "Next Month",
        reset: "Reset",
        cancel: "Cancel",
        apply: "Apply",
      },
      table: {
        emptyTitle: "No Activities Found",
        emptyBody: "There Are No Rows For This Activity Type Yet.",
        summary: "Showing {{shown}} Of {{total}} Monitored Changes",
        previousPage: "Previous Page",
        nextPage: "Next Page",
        pageNumber: "Page {{page}}",
        colDate: "Date",
        colBlogDetails: "Blog Details",
        colBacklinkDetails: "Backlink Details",
        colChangeDetails: "Work Details",
        colBlogLink: "Blog Link",
        colUrls: "Links",
        colPageLink: "Page Link",
        colActions: "Actions",
        editActivity: "Edit Activity",
        deleteActivity: "Delete Activity",
        deleteTitle: "Delete Activity?",
        deleteBody: "This Activity Will Be Removed From The Selected Project.",
        deleteCancel: "Cancel",
        deleteConfirm: "Delete",
        deleteSuccess: "Activity Deleted.",
        deleteErrorFallback: "Could Not Delete Activity. Try Again.",
        loadErrorBody: "Could Not Load SEO Activities. Try Again.",
      },
      selectProjectTitle: "Select A Project",
      selectProjectBody: "Choose A Project From The Sidebar To Manage Its SEO Activities.",
      export: {
        excel: "Export Excel",
        success: "Excel Report Downloaded.",
        empty: "No Activities Match The Current Filters.",
        errorFallback: "Could Not Export Activities. Try Again.",
      },
      quickAdd: {
        trigger: "Add Activity",
        title: "Quick Add",
        lead: "Capture A New SEO Activity In A Few Seconds.",
        editTitle: "Edit Activity",
        editLead: "Update The Fields Below, Then Save Your Changes.",
        close: "Close",
        tabsAriaLabel: "Activity Type",
        tabs: {
          blogs: "Blogs",
          backlinks: "Backlinks",
          technical_work: "Technical Work",
        },
        fields: {
          title: "Blog Title",
          titlePh: "How To Improve Local SEO Rankings",
          anchorText: "Anchor Text",
          anchorTextPh: "Best SEO Agency",
          details: "Work Details",
          detailsPh: "Updated Meta Description On Services Page",
          url: "Link",
          urlPh: "https://example.com/page",
          occurredOn: "Date",
        },
        validation: {
          required: "This Field Is Required.",
          url: "Enter A Valid Http Or Https Link.",
          date: "Enter A Valid Date.",
          minTitle: "Use At Least 3 Characters.",
          minAnchor: "Use At Least 2 Characters.",
          minDetails: "Use At Least 4 Characters.",
        },
        cancel: "Cancel",
        submit: "Add Activity",
        save: "Save Changes",
        success: {
          blogs: "Blog Activity Added.",
          backlinks: "Backlink Activity Added.",
          technical_work: "Technical Work Activity Added.",
        },
        updateSuccess: {
          blogs: "Blog Activity Updated.",
          backlinks: "Backlink Activity Updated.",
          technical_work: "Technical Work Activity Updated.",
        },
        createErrorFallback: "Could Not Create Activity. Try Again.",
        updateErrorFallback: "Could Not Update Activity. Try Again.",
      },
    },
    leads: {
      title: "Leads",
    },
    roles: {
      title: "Roles & Permissions",
      subtitle: "Manage Role Templates And Their Permission Sets.",
      createRoleTitle: "Create Role",
      editRoleTitle: "Edit Role",
      createForm: {
        title: "Create Role",
        lead: "Give The Role A Name And Select The Permissions It Should Grant.",
        editTitle: "Edit Role",
        editLead: "Update The Role Name And Permissions, Then Save Your Changes.",
        editSubmit: "Save Changes",
        editSubmitting: "Saving…",
        editSuccessTitle: "Role Updated",
        editSuccessFallback: "Role Updated Successfully.",
        editErrorTitle: "Could Not Update Role",
        editErrorFallback: "Could Not Update Role. Try Again.",
        name: "Role Name",
        namePh: "Content Manager",
        description: "Description",
        descriptionPh: "What This Role Is For…",
        systemRoleNameLocked: "System Role Names Can't Be Changed. You Can Still Edit The Description And Permissions.",
        permsHeading: "Select Permissions",
        permsLead: "Choose Which Modules And Actions This Role Can Access.",
        permsModulesHeading: "Modules",
        permsModuleLead: "Toggle The Actions Available For This Module.",
        permsSelectAll: "Select All",
        permsClearAll: "Clear All",
        permsCount: "{{selected}} Of {{total}} Selected",
        permsLoading: "Loading Permissions…",
        permsEmpty: "No Permissions Available.",
        permsLoadErrorTitle: "Could Not Load Permissions",
        permsLoadErrorBody: "Check Your Connection And Try Again.",
        submit: "Create Role",
        submitting: "Creating…",
        successTitle: "Role Created",
        successFallback: "Role Created Successfully.",
        errorTitle: "Could Not Create Role",
        errorFallback: "Could Not Create Role. Try Again.",
        valRequired: "This Field Is Required.",
        valMin: "Use At Least 2 Characters.",
        backToList: "Back To Roles",
      },
      actions: {
        view: "View",
        create: "Create",
        edit: "Edit",
        delete: "Delete",
        invite: "Invite",
        remove: "Remove",
        disconnect: "Disconnect",
        refresh: "Refresh",
      },
      detail: {
        title: "Role Details",
        lead: "Permission Summary For This Role.",
        loading: "Loading Role…",
        overviewTitle: "Role Overview",
        overviewLead: "Membership And Permission Counts For This Role.",
        description: "Description",
        noDescription: "No Description Provided.",
        members: "Members",
        permissionsCount: "Permissions",
        createdAt: "Created",
        updatedAt: "Last Updated",
        permissionsTitle: "Granted Permissions",
        permissionsLead: "Modules And Actions This Role Can Perform.",
        noPermissions: "No Permissions Granted.",
      },
      statusFilter: {
        ariaLabel: "Filter Roles By Status",
        all: "All Roles",
        active: "Active",
        inactive: "Inactive",
      },
      table: {
        searchPlaceholder: "Search Roles...",
        sortLabel: "Sort",
        sortBy: "Sort By",
        sortToggle: "Sort By {{direction}}",
        sortNewest: "Newest",
        sortOldest: "Oldest",
        sortByNewest: "Sort Roles By Newest",
        sortByOldest: "Sort Roles By Oldest",
        colRole: "Role",
        colPermissions: "Permissions",
        colMembers: "Members",
        colSystem: "System",
        colStatus: "Status",
        colActions: "Actions",
        scopePlatform: "Platform",
        scopeProject: "Project",
        permissionsCount: "{{count}} Permissions",
        systemYes: "System",
        systemNo: "Custom",
        statusActive: "Active",
        statusInactive: "Inactive",
        showingRoles: "Showing {{from}} To {{to}} Of {{total}} Roles",
        pageNumber: "Page {{page}}",
        loading: "Loading Roles...",
        emptyTitle: "No Roles Found",
        emptyBody: "Try Another Search Or Clear Filters To View All Roles.",
        viewRole: "View {{name}}",
        editRole: "Edit {{name}}",
        activateRole: "Activate {{name}}",
        deactivateRole: "Deactivate {{name}}",
        activateSuccess: "Role Activated Successfully.",
        deactivateSuccess: "Role Deactivated Successfully.",
        statusActionError: "Could Not Update Role Status. Try Again.",
        deleteRole: "Delete {{name}}",
        deleteTitle: "Delete Role?",
        deleteBody: "This Role Will Be Permanently Removed.\nThis Action Cannot Be Undone.",
        deleteCancel: "Cancel",
        deleteConfirm: "Delete",
        deleteSuccess: "Role Deleted Successfully.",
        deleteErrorFallback: "Could Not Delete Role. Try Again.",
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
      subtitle: "Log In To Your Workspace. Your Crawllex Dashboard Is Ready.",
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
      registrationSuccess: "Account created. Check your email for a verification link, then sign in to continue.",
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
      subtitle: "Create An Account To Get Started With Crawllex",
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
    switchToLight: "Switch To Light Theme",
    switchToDark: "Switch To Dark Theme",
  },
};

export default translation;
