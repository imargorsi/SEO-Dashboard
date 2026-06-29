<x-app-layout>
    <x-slot name="header">
        <h2 class="font-semibold text-xl text-gray-800 leading-tight">
            {{ __('Company dashboard') }}
        </h2>
    </x-slot>

    <div class="py-12">
        <div class="max-w-7xl mx-auto sm:px-6 lg:px-8">
            <div class="bg-white overflow-hidden shadow-sm sm:rounded-lg">
                <div class="p-6 text-gray-900 space-y-2">
                    <p>{{ __('Welcome back, :name.', ['name' => auth()->user()->name]) }}</p>
                    @if ($company)
                        <p class="text-sm text-gray-600">
                            {{ __('You are working in :company.', ['company' => $company->name]) }}
                        </p>
                    @endif
                    <p class="text-sm text-gray-500">
                        {{ __('This area is isolated for your organization. Extend modules (traffic, keywords, reports) here as you grow the product.') }}
                    </p>
                </div>
            </div>
        </div>
    </div>
</x-app-layout>
