<x-app-layout>
    <x-slot name="header">
        <h2 class="font-semibold text-xl text-gray-800 leading-tight">
            {{ __('New company') }}
        </h2>
    </x-slot>

    <div class="py-12">
        <div class="max-w-2xl mx-auto sm:px-6 lg:px-8">
            <div class="bg-white overflow-hidden shadow-sm sm:rounded-lg">
                <div class="p-6 text-gray-900">
                    <form method="POST" action="{{ route('admin.companies.store') }}" class="space-y-6">
                        @csrf

                        <div>
                            <x-input-label for="company_name" :value="__('Company name')" />
                            <x-text-input id="company_name" class="block mt-1 w-full" type="text" name="company_name" :value="old('company_name')" required autofocus />
                            <x-input-error :messages="$errors->get('company_name')" class="mt-2" />
                        </div>

                        <div class="border-t border-gray-100 pt-6 space-y-6">
                            <p class="text-sm font-medium text-gray-700">{{ __('Primary admin (tenant login)') }}</p>

                            <div>
                                <x-input-label for="admin_name" :value="__('Admin name')" />
                                <x-text-input id="admin_name" class="block mt-1 w-full" type="text" name="admin_name" :value="old('admin_name')" required />
                                <x-input-error :messages="$errors->get('admin_name')" class="mt-2" />
                            </div>

                            <div>
                                <x-input-label for="admin_email" :value="__('Admin email')" />
                                <x-text-input id="admin_email" class="block mt-1 w-full" type="email" name="admin_email" :value="old('admin_email')" required />
                                <x-input-error :messages="$errors->get('admin_email')" class="mt-2" />
                            </div>

                            <p class="text-sm text-gray-600">
                                {{ __('A secure password is generated automatically and sent to this email address.') }}
                            </p>
                        </div>

                        <div class="flex items-center gap-4">
                            <x-primary-button>{{ __('Create company') }}</x-primary-button>
                            <a href="{{ route('admin.companies.index') }}" class="text-sm text-gray-600 hover:text-gray-900">{{ __('Cancel') }}</a>
                        </div>
                    </form>
                </div>
            </div>
        </div>
    </div>
</x-app-layout>
