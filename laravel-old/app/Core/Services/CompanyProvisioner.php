<?php

namespace App\Core\Services;

use App\Mail\CompanyApprovedMail;
use App\Mail\CompanyRegistrationPendingMail;
use App\Mail\PocCompanyWelcomeMail;
use App\Models\Company;
use App\Models\User;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Mail;
use Illuminate\Support\Str;
use Throwable;

class CompanyProvisioner
{
    /**
     * Create a tenant company and the POC as the first `company_admin` user.
     *
     * @param  array{
     *     company_name: string,
     *     poc_name: string,
     *     poc_email: string,
     *     password?: string,
     *     status?: string,
     *     is_active?: bool
     * }  $data
     */
    public function provision(array $data): Company
    {
        $status = $data['status'] ?? Company::STATUS_APPROVED;
        $isActive = $data['is_active'] ?? ($status === Company::STATUS_APPROVED);
        $plainPassword = $data['password'] ?? Str::password(length: 16, letters: true, numbers: true, symbols: true);
        $verifyEmail = $status === Company::STATUS_APPROVED;

        [$company, $user] = DB::transaction(function () use ($data, $status, $isActive, $plainPassword, $verifyEmail) {
            $slug = $this->uniqueSlug(Str::slug($data['company_name']));

            $company = Company::create([
                'name' => $data['company_name'],
                'slug' => $slug,
                'poc_name' => $data['poc_name'],
                'poc_email' => $data['poc_email'],
                'status' => $status,
                'is_active' => $isActive,
            ]);

            $user = User::create([
                'company_id' => $company->id,
                'name' => $data['poc_name'],
                'email' => $data['poc_email'],
                'password' => $plainPassword,
                'email_verified_at' => $verifyEmail ? now() : null,
            ]);

            $user->assignRole('company_admin');

            return [$company, $user];
        });

        $this->sendProvisionMails($company, $user, $plainPassword, $status);

        return $company;
    }

    public function approve(Company $company): Company
    {
        if (! $company->isPending()) {
            abort(422, __('Only pending companies can be approved.'));
        }

        $poc = $this->resolvePocUser($company);

        DB::transaction(function () use ($company, $poc): void {
            $company->status = Company::STATUS_APPROVED;
            $company->is_active = true;
            $company->save();

            if ($poc !== null && $poc->email_verified_at === null) {
                $poc->email_verified_at = now();
                $poc->save();
            }
        });

        $company->refresh();

        if ($poc !== null) {
            try {
                Mail::to($poc->email)->send(new CompanyApprovedMail($company, $poc));
            } catch (Throwable $e) {
                report($e);
            }
        }

        return $company;
    }

    private function sendProvisionMails(Company $company, User $user, string $plainPassword, string $status): void
    {
        try {
            if ($status === Company::STATUS_PENDING) {
                Mail::to($user->email)->send(new CompanyRegistrationPendingMail($company, $user));

                return;
            }

            Mail::to($user->email)->send(new PocCompanyWelcomeMail($company, $user, $plainPassword));
        } catch (Throwable $e) {
            report($e);
        }
    }

    private function resolvePocUser(Company $company): ?User
    {
        $poc = User::query()
            ->where('company_id', $company->id)
            ->where('email', $company->poc_email)
            ->first();

        if ($poc !== null) {
            return $poc;
        }

        return User::query()
            ->where('company_id', $company->id)
            ->role('company_admin')
            ->first();
    }

    private function uniqueSlug(string $base): string
    {
        $slug = $base !== '' ? $base : Str::lower(Str::random(8));
        $candidate = $slug;
        $i = 1;

        while (Company::where('slug', $candidate)->exists()) {
            $candidate = $slug.'-'.$i;
            $i++;
        }

        return $candidate;
    }
}
